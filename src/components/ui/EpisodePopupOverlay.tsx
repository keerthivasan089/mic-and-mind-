import React from 'react';
import { EpisodeExpandedPopup, EpisodeExpandedPopupProps } from './EpisodeExpandedPopup';

export type EpisodePopupOverlayProps = EpisodeExpandedPopupProps;

/**
 * Re-export EpisodeExpandedPopup under EpisodePopupOverlay for clean backwards compatibility.
 */
export const EpisodePopupOverlay: React.FC<EpisodePopupOverlayProps> = (props) => {
  return <EpisodeExpandedPopup {...props} />;
};

export { EpisodeExpandedPopup };
