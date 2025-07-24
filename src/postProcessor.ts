import { MarkdownPostProcessor, setIcon } from 'obsidian';

import { CalloutConfig } from './settings';

function getFirstTextNode(li: HTMLElement) {
  for (const node of Array.from(li.childNodes)) {
    if (node.nodeType === document.ELEMENT_NODE && (node as HTMLElement).classList.contains('tasks-list-text')) {
      const descriptionNode = (node as HTMLElement).firstElementChild
      if (descriptionNode?.classList.contains('task-description')) {
        const textNode = descriptionNode.firstElementChild?.firstChild;
        if (textNode.nodeType === document.TEXT_NODE) {
          return textNode;
        }
      }
    }

    if (
      node.nodeType === document.ELEMENT_NODE &&
      (node as HTMLElement).tagName === 'P'
    ) {
      return node.firstChild;
    }

    if (node.nodeType !== document.TEXT_NODE) {
      continue;
    }

    if ((node as Text).nodeValue.trim() === '') {
      continue;
    }

    return node;
  }

  return null;
}

function findAndProcessTags(li: HTMLElement, config: CalloutConfig) {
  // Find all text nodes in the list item
  const walker = document.createTreeWalker(
    li,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let textNode;
  while (textNode = walker.nextNode()) {
    const text = textNode.textContent;
    if (!text) continue;

    const match = text.match(config.re);
    if (match) {
      const callout = config.callouts[match[1]];
      if (callout) {
        // Apply callout styling to the list item
        li.addClass('lc-list-callout');
        li.setAttribute('data-callout', callout.tag);
        li.style.setProperty('--lc-callout-color', callout.color);

        // Replace the tag with styled marker
        const tagStart = match.index!;
        const tagEnd = tagStart + match[0].length;
        
        const beforeText = text.slice(0, tagStart);
        const afterText = text.slice(tagEnd);

        const fragment = createFragment((f) => {
          if (beforeText) {
            f.appendText(beforeText);
          }
          f.append(
            createSpan(
              {
                cls: 'lc-list-marker',
                text: `#${callout.tag}`,
              },
              (span) => {
                if (callout.icon) {
                  setIcon(span, callout.icon);
                }
              }
            )
          );
          if (afterText) {
            f.appendText(afterText);
          }
        });

        textNode.replaceWith(fragment);
        break; // Only process the first tag found
      }
    }
  }
}

function wrapLiContent(li: HTMLElement) {
  const toReplace: ChildNode[] = [];
  let insertBefore = null;

  for (let i = 0, len = li.childNodes.length; i < len; i++) {
    const child = li.childNodes.item(i);

    if (child.nodeType === document.ELEMENT_NODE) {
      const el = child as Element;
      if (
        el.hasClass('list-collapse-indicator') ||
        el.hasClass('list-bullet')
      ) {
        continue;
      }

      if (['UL', 'OL'].includes(el.tagName)) {
        insertBefore = child;
        break;
      }
    }

    toReplace.push(child);
  }

  const wrapper = createSpan({ cls: 'lc-li-wrapper' });

  toReplace.forEach((node) => wrapper.append(node));

  if (insertBefore) {
    insertBefore.before(wrapper);
  } else {
    li.append(wrapper);
  }
}

export function buildPostProcessor(
  getConfig: () => CalloutConfig
): MarkdownPostProcessor {
  return async (el, ctx: any) => {
    const config = getConfig();

    if (ctx.promises?.length) {
      await Promise.all(ctx.promises);
    }

    el.findAll('li').forEach((li) => {
      findAndProcessTags(li, config);
      
      // If we found a callout, wrap the content
      if (li.hasClass('lc-list-callout')) {
        wrapLiContent(li);
      }
    });
  };
}
