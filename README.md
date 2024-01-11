# Word Limit README

`Word Limit` is a markdown word counter that helps you avoid going over a word limit in markdown files.

## Features

If you specify a word limit, it will change your text background to red when you exceed that limit.

You specify the word limit by adding a comment with the form

```md
<!-- limit: 500 -->
```

(Comments are ignored in the word count, so this tag won't count.)

## Requirements

None!

## Extension Settings

None!

Word limits are edited in-file using a comment of the form

```md
<!-- limit: 500 -->
```

Hint: you can get the comment scaffold quickly in a markdown file using the comment shortcut (`CMD-/` on a mac, `CTRL-/` on Linux or Windows).

## Known Issues

None!

## Release Notes

### 1.0.0

Initial release of word limit
