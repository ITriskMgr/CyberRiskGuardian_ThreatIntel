#!/usr/bin/env python3
"""Writes js/data/sources.js from crg_feeds.SOURCES so the app shows the source catalogue without the helper."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..'))
import crg_feeds
out = os.path.join(HERE, '..', 'js', 'data', 'sources.js')
open(out, 'w', encoding='utf-8').write('/* sources.js — feed source catalogue, generated from crg_feeds.py by tools/build_sources.py. */\nself.CRG_SOURCES = '
    + json.dumps(crg_feeds.SOURCES, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(crg_feeds.SOURCES), 'sources')
