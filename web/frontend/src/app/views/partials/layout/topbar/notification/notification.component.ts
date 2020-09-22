// Angular
import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'kt-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['notification.component.scss']
})
export class NotificationComponent {

	// Show dot on top of the icon
	@Input() dot: string;

	// Show pulse on icon
	@Input() pulse: boolean;

	@Input() pulseLight: boolean;

	// Set icon class name
	@Input() icon = 'flaticon2-bell-alarm-symbol';
	@Input() iconType: '' | 'success';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	// Set skin color, default to light
	@Input() skin: 'light' | 'dark' = 'light';

	@Input() type: 'brand' | 'success' = 'success';

	/**
	 * Component constructor
	 *
	 * @param sanitizer: DomSanitizer
	 */
	constructor(private sanitizer: DomSanitizer) {
	}

	backGroundStyle(): string {
		if (!this.bgImage) {
			return 'none';
		}

		return 'url(' + this.bgImage + ')';
	}
}
