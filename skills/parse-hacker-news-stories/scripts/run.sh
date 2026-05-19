#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${INPUT_FILE:-/tmp/fetch-hacker-news-front-page_${RUN_ID}.json}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/parse-hacker-news-stories_${RUN_ID}.json}"

python3 - "$INPUT_FILE" "$OUTPUT_FILE" <<'PY'
import json
import re
import sys
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urljoin

input_file, output_file = sys.argv[1], sys.argv[2]

class HNParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.current = None
        self.in_titlelink = False
        self.in_score = False
        self.in_user = False
        self.in_age = False
        self.link_href = ""
        self.text = ""
        self.subtext = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        cls = attrs.get("class", "")
        if tag == "tr" and "athing" in cls:
            self.current = {"id": attrs.get("id", ""), "title": "", "url": "", "points": 0, "author": "", "comments": 0, "age": ""}
        elif self.current is not None and tag == "a" and "titleline" in cls:
            pass
        elif self.current is not None and tag == "a" and ("titlelink" in cls or self._in_titleline_context(attrs)):
            self.in_titlelink = True
            self.link_href = attrs.get("href", "")
            self.text = ""
        elif self.subtext is not None and tag == "span" and "score" in cls:
            self.in_score = True; self.text = ""
        elif self.subtext is not None and tag == "a" and "hnuser" in cls:
            self.in_user = True; self.text = ""
        elif self.subtext is not None and tag == "span" and "age" in cls:
            self.in_age = True; self.text = ""

    def _in_titleline_context(self, attrs):
        # Modern HN uses span.titleline > a without a class on the link.
        return bool(attrs.get("href")) and self.current is not None and not self.current.get("title")

    def handle_endtag(self, tag):
        if tag == "a" and self.in_titlelink:
            self.current["title"] = unescape(self.text.strip())
            self.current["url"] = urljoin("https://news.ycombinator.com/", self.link_href.strip())
            self.in_titlelink = False
        elif tag == "span" and self.in_score:
            m = re.search(r"(\d+)", self.text)
            if m: self.subtext["points"] = int(m.group(1))
            self.in_score = False
        elif tag == "a" and self.in_user:
            self.subtext["author"] = self.text.strip()
            self.in_user = False
        elif tag == "span" and self.in_age:
            self.subtext["age"] = self.text.strip()
            self.in_age = False
        elif tag == "tr" and self.subtext is not None:
            if self.rows:
                self.rows[-1].update(self.subtext)
            self.subtext = None
        elif tag == "tr" and self.current is not None:
            if self.current.get("id") and self.current.get("title"):
                self.rows.append(self.current)
                self.subtext = {"points": 0, "author": "", "comments": 0, "age": ""}
            self.current = None

    def handle_data(self, data):
        if self.in_titlelink or self.in_score or self.in_user or self.in_age:
            self.text += data
        if self.subtext is not None and "comment" in data:
            m = re.search(r"(\d+)\s+comments?", data)
            self.subtext["comments"] = int(m.group(1)) if m else 0
        elif self.subtext is not None and "discuss" in data:
            self.subtext["comments"] = 0

with open(input_file, "r", encoding="utf-8") as f:
    payload = json.load(f)
parser = HNParser()
parser.feed(payload.get("html", ""))
stories = parser.rows[:20]
if len(stories) < 1:
    print("No Hacker News stories were found in the fetched page.", file=sys.stderr)
    raise SystemExit(1)
for story in stories:
    if not story.get("author"):
        story["author"] = "unknown"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump({"fetched_at": payload.get("fetched_at"), "stories": stories}, f, ensure_ascii=False)
PY
