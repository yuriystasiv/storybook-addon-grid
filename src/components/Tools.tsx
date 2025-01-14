import React from 'react';

import { useAddonState, useParameter, useStorybookApi } from '@storybook/api';
import {
	eventToShortcut,
	shortcutMatchesShortcut,
	shortcutToHumanString,
} from '@storybook/manager-api';
import { IconButton } from '@storybook/components';
import { PREVIEW_KEYDOWN, STORY_RENDERED } from '@storybook/core-events';
import type { AddonParameters, AddonState } from 'storybook-addon-grid';
import { ADDON_ID, PARAM_KEY } from '../constants';
import { ManagerRenderedGridsContainer } from './Grids';

let shortcut = ['control', 'G'];

export function Tools() {
	let parameters = useParameter<AddonParameters>(PARAM_KEY, {});
	let [state, setState] = useAddonState<AddonState>(ADDON_ID, {
		visible: false,
	});
	let [ready, setReady] = React.useState(false);
	let api = useStorybookApi();

	let toggleGrid = React.useCallback(() => {
		setState(
			(prev) => ({
				visible: !prev?.visible ?? false,
			}),
			{
				persistence: 'session',
			},
		);
	}, []);

	// Keyboard events
	React.useEffect(() => {
		function handler(event: KeyboardEvent) {
			if (focusInInput(event)) return;
			if (shortcutMatchesShortcut(eventToShortcut(event)!, shortcut)) {
				event.preventDefault?.();
				toggleGrid();
			}
		}

		function previewHandler(data: { event: KeyboardEvent }) {
			handler(data.event);
		}

		document.addEventListener('keydown', handler);

		// KeyDown events from the preview iframe.
		api.on(PREVIEW_KEYDOWN, previewHandler);

		return () => {
			document.removeEventListener('keydown', handler);
			api.off(PREVIEW_KEYDOWN, previewHandler);
		};
	}, [api, toggleGrid]);

	// Avoid some "getting ready" states
	React.useEffect(() => {
		let mounted = true;
		function handler() {
			mounted && setReady(true);
		}

		api.once(STORY_RENDERED, handler);

		return () => {
			mounted = false;
		};
	}, [api]);

	let disabled =
		typeof parameters.disable === 'boolean' ? parameters.disable : false;
	let isActive = disabled ? !disabled : state.visible;

	return (
		<>
			<IconButton
				title={`Turn on Column Grid [${shortcutToHumanString(
					shortcut,
				)}]`}
				disabled={disabled}
				active={isActive}
				onClick={toggleGrid}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
				>
					<path d="M3 6.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C4.52 3 5.08 3 6.2 3h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C10 4.52 10 5.08 10 6.2v11.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C8.48 21 7.92 21 6.8 21h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 19.48 3 18.92 3 17.8V6.2Z" />
					<path d="M14 6.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C15.52 3 16.08 3 17.2 3h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C21 4.52 21 5.08 21 6.2v11.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C14 19.48 14 18.92 14 17.8V6.2Z" />
				</svg>
			</IconButton>
			{ready && !disabled ? <ManagerRenderedGridsContainer /> : null}
		</>
	);
}

function focusInInput(event: any) {
	return event.target
		? /input|textarea/i.test(event.target.tagName) ||
				event.target.getAttribute('contenteditable') !== null
		: false;
}
