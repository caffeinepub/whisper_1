/**
 * TEMPORARY DRAFT PREVIEW BLOCKER
 * 
 * This script prevents Caffeine's draft preview system from injecting editor scripts
 * that cause "disallowed origin" errors and blank white screens.
 * 
 * SCOPE: Only activates on Caffeine draft preview hostnames (e.g., *-draft.caffeine.xyz)
 * BEHAVIOR: Intercepts script injection and blocks known draft-editor patterns
 * STATUS: Temporary mitigation until platform-level fix is available
 */

(function() {
  'use strict';

  // Only activate on Caffeine draft preview hostnames
  const hostname = window.location.hostname;
  const isDraftPreview = hostname.includes('-draft.caffeine.xyz') || hostname.includes('-draft.caffeine.ai');
  
  if (!isDraftPreview) {
    console.log('[Blocker] Not a draft preview environment, blocker inactive');
    return;
  }

  console.log('[Blocker] Draft preview detected, activating script blocker');

  // Patterns to block
  const BLOCKED_PATTERNS = [
    /draft-script\.js/i,
    /draft-editor/i,
    /editor-script/i,
    /caffeine-editor/i
  ];

  // Track blocked attempts
  let blockedCount = 0;

  /**
   * Check if a URL or script identifier should be blocked
   */
  function shouldBlock(url) {
    if (!url) return false;
    return BLOCKED_PATTERNS.some(pattern => pattern.test(url));
  }

  /**
   * Intercept createElement to block script injection
   */
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.apply(document, arguments);
    
    if (tagName.toLowerCase() === 'script') {
      // Wrap the src setter to intercept script URLs
      const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      
      Object.defineProperty(element, 'src', {
        get: function() {
          return originalSrcDescriptor.get.call(this);
        },
        set: function(value) {
          if (shouldBlock(value)) {
            blockedCount++;
            console.warn('[Blocker] Blocked draft editor script:', value);
            // Set to empty data URL to prevent load
            return originalSrcDescriptor.set.call(this, 'data:text/javascript,');
          }
          return originalSrcDescriptor.set.call(this, value);
        },
        configurable: true
      });
    }
    
    return element;
  };

  /**
   * Intercept appendChild to catch inline script injection
   */
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    if (child.tagName === 'SCRIPT') {
      const src = child.src || child.getAttribute('src');
      const textContent = child.textContent || child.innerText;
      
      // Check src attribute
      if (src && shouldBlock(src)) {
        blockedCount++;
        console.warn('[Blocker] Blocked appendChild script with src:', src);
        return child; // Return without appending
      }
      
      // Check inline script content
      if (textContent && BLOCKED_PATTERNS.some(pattern => pattern.test(textContent))) {
        blockedCount++;
        console.warn('[Blocker] Blocked appendChild inline script');
        return child; // Return without appending
      }
    }
    
    return originalAppendChild.call(this, child);
  };

  /**
   * Intercept insertBefore for script injection
   */
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (newNode.tagName === 'SCRIPT') {
      const src = newNode.src || newNode.getAttribute('src');
      const textContent = newNode.textContent || newNode.innerText;
      
      if (src && shouldBlock(src)) {
        blockedCount++;
        console.warn('[Blocker] Blocked insertBefore script with src:', src);
        return newNode;
      }
      
      if (textContent && BLOCKED_PATTERNS.some(pattern => pattern.test(textContent))) {
        blockedCount++;
        console.warn('[Blocker] Blocked insertBefore inline script');
        return newNode;
      }
    }
    
    return originalInsertBefore.call(this, newNode, referenceNode);
  };

  /**
   * Monitor for MutationObserver-based injection
   */
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.tagName === 'SCRIPT') {
          const src = node.src || node.getAttribute('src');
          if (src && shouldBlock(src)) {
            blockedCount++;
            console.warn('[Blocker] Detected and removing injected script:', src);
            node.remove();
          }
        }
      });
    });
  });

  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Log status after page load
  window.addEventListener('load', function() {
    console.log('[Blocker] Page loaded. Blocked scripts:', blockedCount);
  });

  console.log('[Blocker] Script blocker initialized successfully');
})();
