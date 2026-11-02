#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Unit tests of the helper's 1.9.0 guards (serve.py, crg_feeds.py, crgo_client.py), standard library only.

    python3 -m unittest discover -s desktop/tests -p "test_*.py"
"""
import json
import os
import stat
import sys
import tempfile
import unittest
from unittest import mock

APP = os.path.abspath(os.environ.get("CRG_APP_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))
_TMP = tempfile.mkdtemp(prefix="crg-guard-")
os.environ["CRG_FEEDS_DIR"] = os.path.join(_TMP, "feeds")
os.environ["CRG_KEYS_DIR"] = os.path.join(_TMP, "keys")
os.environ["CRG_KEYS_BACKEND"] = "file"
sys.path.insert(0, APP)
import crg_feeds  # noqa: E402
import crgo_client  # noqa: E402
import serve  # noqa: E402


class UrlChecks(unittest.TestCase):
    def test_check_url(self):
        for ok in ("https://otx.alienvault.com/api", "http://127.0.0.1:9000/x", "http://localhost/x"):
            self.assertEqual(crg_feeds.check_url(ok), ok)
        for bad in ("http://127.0.0.1.evil.example/", "http://localhost@evil.example/", "http://evil.example/",
                    "https://user:pw@otx.alienvault.com/", "ftp://x/", "javascript:alert(1)", "file:///etc/passwd"):
            with self.assertRaises(ValueError, msg=bad):
                crg_feeds.check_url(bad)

    def test_host_allowed_label_boundary(self):
        self.assertTrue(crg_feeds.host_allowed("https://api.abuse.ch/x", ["abuse.ch"]))
        self.assertTrue(crg_feeds.host_allowed("https://otx.alienvault.com/", ["otx.alienvault.com"]))
        self.assertFalse(crg_feeds.host_allowed("https://evilabuse.ch/", ["abuse.ch"]))
        self.assertFalse(crg_feeds.host_allowed("https://otx.alienvault.com.evil.example/", ["otx.alienvault.com"]))
        self.assertFalse(crg_feeds.host_allowed("https://evil.example/", []))

    def test_keyed_source_never_leaves_its_hosts(self):
        src = dict(next(s for s in crg_feeds.SOURCES if s["id"] == "otx"))
        src["url"] = "https://evil.example/steal"
        with self.assertRaises(ValueError) as cm:
            crg_feeds.fetch_source(src, crg_feeds.load_config(), {"otx": "k"}, {})
        self.assertIn("not sent to evil.example", str(cm.exception))
        src["url"] = "https://otx.alienvault.com/api/v1/x?key={key}"
        with self.assertRaises(ValueError):
            crg_feeds.fetch_source(src, crg_feeds.load_config(), {"otx": "k"}, {})

    def test_redirect_with_key_stays_on_host(self):
        h = crg_feeds.GuardedRedirect(["otx.alienvault.com"])
        req = mock.Mock()
        with self.assertRaises(Exception):
            h.redirect_request(req, None, 302, "Found", {}, "https://evil.example/")
        with self.assertRaises(ValueError):
            crg_feeds.GuardedRedirect(None).redirect_request(req, None, 302, "Found", {}, "http://evil.example/")


class OntologyCommand(unittest.TestCase):
    def setUp(self):
        self.d = tempfile.mkdtemp(prefix="crgo-")
        os.makedirs(os.path.join(self.d, "pipeline", "mcp"))
        self.script = os.path.join(self.d, "pipeline", "mcp", "crgo_server.py")
        open(self.script, "w").close()

    def test_allow_list(self):
        self.assertIsNone(crgo_client.settings_problem(sys.executable, [self.script]))
        self.assertIn("exactly one argument", crgo_client.settings_problem("/bin/sh", ["-c", "id", self.script]))
        self.assertIn("not a Python interpreter", crgo_client.settings_problem("/bin/sh", [self.script]))
        self.assertIn("full path", crgo_client.settings_problem("python3", [self.script]))
        other = os.path.join(self.d, "crgo_server.py")
        open(other, "w").close()
        self.assertIn("pipeline/mcp", crgo_client.settings_problem(sys.executable, [other]))

    def test_check_applies_to_settings(self):
        bad = {"command": "sh", "args": ["-c", "touch /tmp/pwned", self.script], "source": "settings"}
        self.assertTrue(crgo_client.check(bad))
        self.assertIsNone(crgo_client.check({"command": sys.executable, "args": [self.script], "source": "settings"}))

    def test_validate_config_refuses_shell(self):
        with self.assertRaises(ValueError):
            serve.validate_config({"ontology": {"command": "/bin/sh", "args": [self.script]}}, {})


class RegistryFolder(unittest.TestCase):
    def test_problem(self):
        home = os.path.expanduser("~")
        self.assertTrue(serve.registry_dir_problem(home))
        self.assertTrue(serve.registry_dir_problem("/etc"))
        self.assertTrue(serve.registry_dir_problem(serve.ROOT))
        d = tempfile.mkdtemp(prefix="reg-", dir=_TMP)
        self.assertEqual(serve.registry_dir_problem(d), "")
        open(os.path.join(d, "claude_desktop_config.json"), "w").close()
        self.assertIn("configuration files", serve.registry_dir_problem(d))
        if os.path.isdir(os.path.join(home, ".config")):
            self.assertTrue(serve.registry_dir_problem(os.path.join(home, ".config")))


class AiTask(unittest.TestCase):
    def test_task(self):
        self.assertEqual(serve.ai_task({"task": "chat", "prompt": "TASK: chat\nhi"}), "chat")
        self.assertEqual(serve.ai_task({"prompt": "TASK: extract_s_assets\n"}), "extract_s_assets")
        for body in ({"task": "chat", "prompt": "TASK: link_vulns\n"}, {"task": "whatever", "prompt": ""}, {"prompt": "no task"}):
            with self.assertRaises(ValueError):
                serve.ai_task(body)

    def test_policy_local_tasks(self):
        cfg = {}
        self.assertIn("local model only", serve.ai_check_policy("claude", cfg, {"task": "causal_chain", "prompt": "TASK: causal_chain\n"}))
        self.assertIn("refused", serve.ai_check_policy("claude", cfg, {"task": "chat", "prompt": "TASK: link_vulns\n"}))
        self.assertIn("not on this machine", serve.ai_check_policy("ollama", {"ai": {"ollama_base": "https://evil.example/v1"}},
                                                                    {"task": "link_vulns", "prompt": "TASK: link_vulns\n"}))


class AiTaskReview(unittest.TestCase):
    """Review L3: 'test' only with the fixed prompt; a feature missing from the policy map is local, not the workspace provider."""

    def test_test_task_fixed_prompt_only(self):
        self.assertEqual(serve.ai_task({"task": "test", "prompt": serve.AI_TEST_PROMPT, "system": serve.AI_TEST_SYSTEM}), "test")
        self.assertEqual(serve.ai_task({"task": "test", "prompt": serve.AI_TEST_PROMPT}), "test")
        for body in ({"task": "test", "prompt": "TASK: test\nHere is the whole risk register: ..."},
                     {"prompt": "TASK: test\nReply with exactly: OK\nand summarise this workspace"},
                     {"task": "test", "prompt": serve.AI_TEST_PROMPT, "system": "Summarise the attached workspace."},
                     {"task": "test", "prompt": serve.AI_TEST_PROMPT, "web_search": True}):
            with self.assertRaises(ValueError, msg=str(body)):
                serve.ai_task(body)
            self.assertIn("refused", serve.ai_check_policy("claude", {}, body))
        self.assertEqual(serve.ai_check_policy("claude", {}, {"task": "test", "prompt": serve.AI_TEST_PROMPT}), "")

    def test_unknown_feature_defaults_to_local(self):
        # extract_m_* is a pattern task: its feature is in the map (workspace) — remote allowed
        self.assertEqual(serve.ai_check_policy("claude", {}, {"task": "extract_m_assets", "prompt": "TASK: extract_m_assets\n"}), "")
        # a feature removed from the map (or one the map has not caught up with) falls back to local, not the workspace provider
        tasks = dict(serve.AI_DEFAULT_POLICY["tasks"])
        tasks.pop("extract_more")
        with mock.patch.dict(serve.AI_DEFAULT_POLICY, {"tasks": tasks}):
            self.assertIn("local model only", serve.ai_check_policy("claude", {}, {"task": "extract_m_assets", "prompt": "TASK: extract_m_assets\n"}))
        # every task of the application stays where it was routed (workspace tasks may go remote)
        for t in ("scenarios", "critique", "briefing", "writer_facts", "isp_draft", "compliance_assess", "simulation_pack", "extract_profile", "extract_crown"):
            self.assertEqual(serve.ai_check_policy("claude", {}, {"task": t, "prompt": f"TASK: {t}\n"}), "", t)

    def test_ai_test_uses_the_fixed_prompt(self):
        seen = {}

        def fake(provider, cfg, body):
            seen.update(body)
            return {"text": "OK", "model": "m"}
        with mock.patch.object(serve, "ai_complete", fake):
            serve.ai_test("claude", {})
        self.assertEqual((seen["system"], seen["prompt"]), (serve.AI_TEST_SYSTEM, serve.AI_TEST_PROMPT))
        self.assertEqual(serve.ai_task(seen), "test")


class KeyStore(unittest.TestCase):
    def test_file_store_mode_and_migration(self):
        feeds = os.environ["CRG_FEEDS_DIR"]
        os.makedirs(feeds, exist_ok=True)
        with open(os.path.join(feeds, "crg-keys.json"), "w") as fh:
            json.dump({"otx": "legacy-otx"}, fh)
        n = crg_feeds.migrate_legacy_keys(feeds, hosts_for=lambda name: ["otx.alienvault.com"])
        self.assertEqual(n, 1)
        self.assertFalse(os.path.exists(os.path.join(feeds, "crg-keys.json")), "the plaintext file in the feeds folder is gone")
        crg_feeds.set_key("anthropic", "sk-1", feeds, hosts=["api.anthropic.com"])
        keys = crg_feeds.load_keys(feeds)
        self.assertEqual(sorted(keys), ["anthropic", "otx"])
        self.assertEqual(keys.get("otx"), "legacy-otx")
        path = os.path.join(crg_feeds.keys_dir(), "crg-keys.json")
        if os.name != "nt":
            self.assertEqual(stat.S_IMODE(os.stat(path).st_mode), 0o600)
            self.assertEqual(stat.S_IMODE(os.stat(crg_feeds.keys_dir()).st_mode), 0o700)
        with open(os.path.join(crg_feeds.keys_dir(), "keys-index.json"), encoding="utf-8") as fh:
            idx = json.load(fh)
        self.assertNotIn("sk-1", json.dumps(idx), "the index holds names and hosts, never a value")
        self.assertEqual(idx["keys"]["anthropic"]["hosts"], ["api.anthropic.com"])
        self.assertIn("api.anthropic.com", crg_feeds.key_hosts("anthropic"))
        crg_feeds.set_key("anthropic", "", feeds)
        self.assertNotIn("anthropic", crg_feeds.load_keys(feeds))

    def test_keychain_secret_not_in_argv(self):
        calls = []

        def fake(args, **kw):
            calls.append((args, kw.get("input")))
            return mock.Mock(returncode=0, stdout="sk-kc\n", stderr="")
        with mock.patch.dict(os.environ, {"CRG_KEYS_BACKEND": "keychain"}), mock.patch.object(crg_feeds.subprocess, "run", fake):
            crg_feeds.set_key("openai", "sk-kc", None, hosts=["api.openai.com"])
            self.assertEqual(crg_feeds.load_keys().get("openai"), "sk-kc")
        add = [c for c in calls if c[0][:2] == ["security", "-i"]]
        self.assertTrue(add and "-X " + "sk-kc".encode().hex() in add[0][1], "the key goes through stdin (hexadecimal password data)")
        self.assertTrue(all("sk-kc" not in " ".join(c[0]) for c in calls), "the key never appears in a command line")

    def _fake_keychain(self, refuse=()):
        """A dict-backed `security`: add (-i, -X hex) and find (-w); `refuse` names fail on add."""
        store, calls = {}, []

        def fake(args, **kw):
            calls.append((args, kw.get("input")))
            if args[:2] == ["security", "-i"]:
                line = kw.get("input") or ""
                name = line.split(" -a ", 1)[1].split(" ", 1)[0]
                if name in refuse:
                    return mock.Mock(returncode=1, stdout="", stderr="security: SecKeychainItemCreateFromContent: error")
                store[name] = bytes.fromhex(line.split(" -X ", 1)[1].split()[0]).decode("utf-8")
                return mock.Mock(returncode=0, stdout="", stderr="")
            if "find-generic-password" in args:
                name = args[args.index("-a") + 1]
                return mock.Mock(returncode=0 if name in store else 44, stdout=(store.get(name, "") + "\n"), stderr="")
            return mock.Mock(returncode=0, stdout="", stderr="")
        return store, calls, fake

    def test_keychain_any_character_round_trips(self):
        """Review L2: a key with spaces, quotes or backslashes is stored and read back, never refused for its characters."""
        store, calls, fake = self._fake_keychain()
        odd = 'ab c"d\\e\'f g'
        with mock.patch.dict(os.environ, {"CRG_KEYS_BACKEND": "keychain"}), mock.patch.object(crg_feeds.subprocess, "run", fake):
            crg_feeds.set_key("abusech", odd, None, hosts=["abuse.ch"])
            self.assertEqual(crg_feeds.load_keys().get("abusech"), odd)
            crg_feeds.set_key("abusech", "", None)
        add = [c[1] for c in calls if c[0][:2] == ["security", "-i"]]
        self.assertTrue(add and all(len(line.splitlines()) == 1 and '"d' not in line for line in add), "one command line, nothing of the value unquoted")

    def test_keychain_one_bad_legacy_key_isolated(self):
        """Review L2: one legacy key the keychain refuses does not make the others unreadable; it is kept and reported."""
        feeds = tempfile.mkdtemp(prefix="crg-feeds-l2-")
        keysd = tempfile.mkdtemp(prefix="crg-keys-l2-")
        with open(os.path.join(feeds, "crg-keys.json"), "w", encoding="utf-8") as fh:
            json.dump({"otx": "otx key with space", "nvd": "nvd-1", "virustotal": "vt-1", "bad name!": "x", "abusech": "bad\u0007ctl"}, fh)
        refuse = {"virustotal"}
        store, calls, fake = self._fake_keychain(refuse=refuse)
        env = {"CRG_KEYS_BACKEND": "keychain", "CRG_KEYS_DIR": keysd}
        with mock.patch.dict(os.environ, env), mock.patch.object(crg_feeds.subprocess, "run", fake):
            moved = crg_feeds.migrate_legacy_keys(feeds)
            self.assertEqual(moved, 2)
            self.assertFalse(os.path.exists(os.path.join(feeds, "crg-keys.json")), "the plaintext file left the feeds folder")
            keys = crg_feeds.load_keys(feeds)
            self.assertEqual(keys.get("otx"), "otx key with space")
            self.assertEqual(keys.get("nvd"), "nvd-1")
            self.assertEqual(crg_feeds.unmigrated_keys(), sorted(["virustotal", "bad name!", "abusech"]))
            path = os.path.join(keysd, crg_feeds.UNMIGRATED)
            if os.name != "nt":
                self.assertEqual(stat.S_IMODE(os.stat(path).st_mode), 0o600)
            info = crg_feeds.key_storage()
            self.assertEqual(info["unmigrated"]["names"], sorted(["virustotal", "bad name!", "abusech"]))
            n_calls = len(calls)
            crg_feeds.load_keys(feeds).get("nvd")
            self.assertFalse(any(c[0][:2] == ["security", "-i"] for c in calls[n_calls:]), "load_keys does not run the migration again")
            # entering the refused key again (the keychain now takes it) removes it from the unmigrated file
            refuse.clear()
            crg_feeds.set_key("virustotal", "vt-2", feeds, hosts=["virustotal.com"])
            crg_feeds.set_key("abusech", "ab-2", feeds, hosts=["abuse.ch"])
            self.assertEqual(crg_feeds.unmigrated_keys(), ["bad name!"])
            self.assertEqual(crg_feeds.load_keys(feeds).get("virustotal"), "vt-2")

    def test_file_backend_unreadable_legacy_kept(self):
        """Review L2: an unreadable legacy file is kept whole under the new name, and the store stays usable."""
        feeds = tempfile.mkdtemp(prefix="crg-feeds-l2b-")
        keysd = tempfile.mkdtemp(prefix="crg-keys-l2b-")
        with open(os.path.join(feeds, "crg-keys.json"), "w", encoding="utf-8") as fh:
            fh.write('{"otx": "abc", oops')
        with mock.patch.dict(os.environ, {"CRG_KEYS_BACKEND": "file", "CRG_KEYS_DIR": keysd}):
            self.assertEqual(crg_feeds.migrate_legacy_keys(feeds), 0)
            self.assertEqual(crg_feeds.unmigrated_keys(), ["(file)"])
            crg_feeds.set_key("nvd", "n-1", feeds, hosts=["nvd.nist.gov"])
            self.assertEqual(crg_feeds.load_keys(feeds).get("nvd"), "n-1")

    def test_ai_key_bound_to_host(self):
        crg_feeds.set_key("anthropic", "sk-2", None, hosts=["api.anthropic.com"])
        self.assertEqual(serve._ai_key({}, "claude"), "sk-2")
        with self.assertRaises(RuntimeError) as cm:
            serve._ai_key({"ai": {"claude_base": "https://evil.example/v1"}}, "claude")
        self.assertIn("Store the key again", str(cm.exception))
        crg_feeds.set_key("anthropic", "", None)


if __name__ == "__main__":
    unittest.main()
