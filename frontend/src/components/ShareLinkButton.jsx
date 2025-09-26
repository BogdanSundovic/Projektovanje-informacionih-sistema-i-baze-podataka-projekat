// src/components/ShareLinkButton.jsx
import React, { useState } from 'react';
import { FiShare2 } from 'react-icons/fi';

function ShareLinkButton({ formId, className = 'btn-share', label = '' }) {
  const [copied, setCopied] = useState(false);


  const sharePath = `/form/view/${formId}`;
  const shareUrl = new URL(sharePath, window.location.origin).toString();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <button type="button" onClick={copy} className={className} title={label || 'Kopiraj link'}>
      <FiShare2 size={18} style={{ marginRight: label ? 6 : 0 }} />
      {label ? (copied ? 'Kopirano!' : label) : (copied ? '✔' : null)}
    </button>
  );
}

export default ShareLinkButton;
