# Obsidian List Callouts Tags

Create callouts in lists in Obsidian based on tags.

> **Note:** This is a modified version of the original List Callouts plugin by mgmeyers. The key difference is that this version uses tags (like #important, #urgent) instead of special characters at the beginning of list items.

When you include a tag anywhere in a list item, that item will be styled as a callout with the color associated with that tag:

<img src="https://raw.githubusercontent.com/mgmeyers/obsidian-list-callouts/main/screenshots/01.png" alt="A screenshot of list callouts">

The tags can also be replaced with icons:

<img src="https://raw.githubusercontent.com/mgmeyers/obsidian-list-callouts/main/screenshots/02.png" alt="A screenshot of list callouts with icons">

## How it works

- The plugin scans list items for specific tags (like #important, #urgent, #todo)
- When a tag is found, the entire list item gets highlighted with the color assigned to that tag
- The tag itself can be replaced with an icon for cleaner appearance
- Only the first matching tag in each list item is processed

## Default tags

The plugin comes with 5 predefined tags:
- `#!` - Red
- `#?` - Orange  
- `#$` - Green
- `#~` - Purple
- `#note` - Blue

## Example usage

```markdown
- This is a regular list item
- This item contains #! critical information
- #? Need to clarify this point
- Budget approved - #$ 50,000 allocated
- #~ This might be controversial
- #note Remember to update documentation
```

## Customization

You can fully customize the callouts in the plugin settings:
- **All tags are editable and deletable** - including the default ones
- **Custom tag names** - create your own tags like #priority, #deadline, etc.
- **Custom colors** - change colors for any tag (default or custom)
- **Custom icons** - replace tags with icons from Obsidian's icon library
- **Style Settings integration** - adjust padding and other visual properties

The padding of the callouts can be adjusted using the Style Settings plugin.
