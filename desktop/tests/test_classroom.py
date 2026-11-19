#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Classroom packs (BL-25/26, spec §2, §7): signing, refusal of an altered pack, course-key pinning, announced key
changes, submission checksums and the late flag. Each test runs in its own key folder (CRG_KEYS_DIR)."""
import copy
import os
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))
import crg_classroom as C  # noqa: E402


def body(course="GRC-101-A26", kind="assignment", **settings):
    s = {"ai": [], "proposals": False, "reveal": "after", "due": "2026-12-01"}
    s.update(settings)
    return {"kind": kind, "course": {"id": course, "title": "Cyber governance"}, "title": "Lab 1 — context",
            "issued": "2026-11-19", "settings": s, "content": {"steps": [1, 2, 3], "case": "medibec"}}


class Base(unittest.TestCase):
    def setUp(self):
        self.dirs = [tempfile.mkdtemp(prefix="crgcls-")]
        self._old = os.environ.get("CRG_KEYS_DIR")
        os.environ["CRG_KEYS_DIR"] = self.dirs[0]

    def use(self, i):
        while len(self.dirs) <= i:
            self.dirs.append(tempfile.mkdtemp(prefix="crgcls-"))
        os.environ["CRG_KEYS_DIR"] = self.dirs[i]

    def tearDown(self):
        if self._old is None:
            os.environ.pop("CRG_KEYS_DIR", None)
        else:
            os.environ["CRG_KEYS_DIR"] = self._old
        for d in self.dirs:
            shutil.rmtree(d, ignore_errors=True)


class InstructorKey(Base):
    def test_made_once_secret_private(self):
        k1 = C.instructor_key()
        k2 = C.instructor_key()
        self.assertEqual(k1["public_key"], k2["public_key"])
        self.assertRegex(k1["fingerprint"], r"^[0-9A-F]{4}( [0-9A-F]{4}){3}$")
        sec = os.path.join(C.home(), "instructor.key")
        if os.name == "posix":
            self.assertEqual(os.stat(sec).st_mode & 0o777, 0o600)
            self.assertEqual(os.stat(C.home()).st_mode & 0o777, 0o700)

    def test_no_key_without_create(self):
        self.assertIsNone(C.instructor_key(create=False))

    def test_pack_never_carries_the_secret(self):
        p = C.sign_pack(body())
        secret_hex = open(os.path.join(C.home(), "instructor.key")).read().strip()
        self.assertNotIn(secret_hex, str(p))


class Packs(Base):
    def test_sign_then_verify_new_course_then_pinned(self):
        p = C.sign_pack(body())
        self.use(1)                                   # the student's computer
        r = C.verify_pack(p)
        self.assertEqual(r["status"], "new-course")
        self.assertTrue(C.accept_pack(p, today="2026-11-19")["accepted"])
        self.assertEqual(C.verify_pack(p)["status"], "verified")
        self.assertEqual(C.pins()["GRC-101-A26"]["pinned"], "2026-11-19")

    def test_altered_pack_refused(self):
        p = C.sign_pack(body())
        self.use(1)
        for mutate in (lambda q: q["body"]["settings"]["ai"].append("consultant"),
                       lambda q: q["body"]["settings"].update(reveal="immediate"),
                       lambda q: q["body"]["content"].update(case="canaretail"),
                       lambda q: q["body"].update(title="Lab 1")):
            q = copy.deepcopy(p)
            mutate(q)
            r = C.accept_pack(q)
            self.assertEqual(r["status"], "invalid")
            self.assertFalse(r["accepted"])
        self.assertEqual(C.pins(), {})                # nothing pinned by a refused pack

    def test_malformed(self):
        self.assertEqual(C.verify_pack({"schema": "x"})["status"], "malformed")
        p = C.sign_pack(body())
        q = copy.deepcopy(p)
        q["signature"] = "garbage"
        self.assertEqual(C.verify_pack(q)["status"], "malformed")
        with self.assertRaises(ValueError):
            C.sign_pack(body(course="bad id!"))
        with self.assertRaises(ValueError):
            C.sign_pack(body(reveal="sometimes"))

    def test_key_change_refused_unless_confirmed_and_journalled(self):
        p1 = C.sign_pack(body())                      # instructor A
        self.use(1)
        C.accept_pack(p1, today="2026-11-19")
        self.use(2)
        p2 = C.sign_pack(body())                      # instructor B (another key), same course
        self.use(1)
        r = C.accept_pack(p2)
        self.assertEqual(r["status"], "key-change")
        self.assertFalse(r["accepted"])
        self.assertEqual(C.pins()["GRC-101-A26"]["fingerprint"], r["pinned"])
        r = C.accept_pack(p2, confirm_key_change=True, today="2026-11-20")
        self.assertTrue(r["accepted"])
        pin = C.pins()["GRC-101-A26"]
        self.assertEqual(pin["fingerprint"], r["fingerprint"])
        self.assertEqual(len(pin["changes"]), 1)
        self.assertEqual(pin["changes"][0]["on"], "2026-11-20")
        self.assertEqual(C.verify_pack(p2)["status"], "verified")
        self.assertEqual(C.verify_pack(p1)["status"], "key-change")

    def test_courses_pinned_independently(self):
        p1 = C.sign_pack(body(course="A"))
        self.use(2)
        p2 = C.sign_pack(body(course="B"))
        self.use(1)
        self.assertTrue(C.accept_pack(p1)["accepted"])
        self.assertTrue(C.accept_pack(p2)["accepted"])
        self.assertEqual(sorted(C.pins()), ["A", "B"])


class Submissions(Base):
    def test_intact_altered_late(self):
        s = C.make_submission({"course": "GRC-101-A26", "pack": "Lab 1", "student": "Team 3", "due": "2026-12-01",
                               "workspace": {"name": "MediBec"}}, now="2026-11-30T23:00:00+00:00")
        self.assertFalse(s["body"]["late"])
        self.assertEqual(C.check_submission(s)["status"], "intact")
        t = copy.deepcopy(s)
        t["body"]["workspace"]["name"] = "Other"
        self.assertEqual(C.check_submission(t)["status"], "altered")
        late = C.make_submission({"due": "2026-12-01"}, now="2026-12-02T08:00:00+00:00")
        r = C.check_submission(late)
        self.assertTrue(r["late"])
        self.assertEqual(r["status"], "intact")       # late is marked, never refused
        self.assertEqual(C.check_submission({"schema": "x"})["status"], "malformed")


if __name__ == "__main__":
    unittest.main()
