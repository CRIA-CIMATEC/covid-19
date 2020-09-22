import { AfterContentChecked, Component, ContentChildren, Directive, EventEmitter, Input, Output, QueryList,
	TemplateRef, ChangeDetectionStrategy } from '@angular/core';

let nextId = 0;
/**
 * This directive should be used to wrap accordion panel titles that need to contain HTML markup or other directives.
 */
@Directive({
	// tslint:disable-next-line:directive-selector
	selector: 'ng-template[AccordionControlPanelTitle]'
})
export class AccordionControlPanelTitleDirective {
	constructor(public templateRef: TemplateRef<any>) { }
}

/**
 * This directive must be used to wrap accordion panel content.
 */
@Directive({
	// tslint:disable-next-line:directive-selector
	selector: 'ng-template[AccordionControlPanelContent]'
})
export class AccordionControlPanelContentDirective {
	constructor(public templateRef: TemplateRef<any>) { }
}

/**
 * The NgbPanel directive represents an individual panel with the title and collapsible
 * content
 */
@Directive({
	// tslint:disable-next-line:directive-selector
	selector: 'kt-accordion-control-panel'
})
export class AccordionControlPanelDirective implements AfterContentChecked {
	/**
	 *  A flag determining whether the panel is disabled or not.
	 *  When disabled, the panel cannot be toggled.
	 */
	@Input() disabled = false;
	height = 0;
	contentHeight = 0;

	/**
	 *  An optional id for the panel. The id should be unique.
	 *  If not provided, it will be auto-generated.
	 */
	@Input() id = `kt-accordion-control-panel-${nextId++}`;

	/**
	 * A flag telling if the panel is currently open
	 */
	isOpen = false;

	/**
	 *  The title for the panel.
	 */
	@Input() title: string;
	/**
	 *  The icon for the panel
	 */
	@Input() iconClass: string;

	@Input() hasBodyWrapper: string;


	/**
	 *  Accordion's types of panels to be applied per panel basis.
	 *  Bootstrap recognizes the following types: "primary", "secondary", "success", "danger", "warning", "info", "light"
	 * and "dark"
	 */
	@Input() type: string;

	titleTpl: AccordionControlPanelTitleDirective | null;
	contentTpl: AccordionControlPanelContentDirective | null;

	@ContentChildren(AccordionControlPanelTitleDirective, { descendants: false }) titleTpls: QueryList<AccordionControlPanelTitleDirective>;
	@ContentChildren(AccordionControlPanelContentDirective, { descendants: false }) contentTpls:
		QueryList<AccordionControlPanelContentDirective>;

	ngAfterContentChecked() {
		// We are using @ContentChildren instead of @ContantChild as in the Angular version being used
		// only @ContentChildren allows us to specify the {descendants: false} option.
		this.titleTpl = this.titleTpls.first;
		this.contentTpl = this.contentTpls.first;
	}
}

/**
 * The payload of the change event fired right before toggling an accordion panel
 */
export interface AccordionControlPanelChangeEvent {
	/**
	 * Id of the accordion panel that is toggled
	 */
	panelId: string;

	/**
	 * Whether the panel will be opened (true) or closed (false)
	 */
	nextState: boolean;

	/**
	 * Function that will prevent panel toggling if called
	 */
	preventDefault: () => void;
}


/**
 * The NgbAccordion directive is a collection of panels.
 * It can assure that only one panel can be opened at a time.
 */
@Component({
	selector: 'kt-accordion-control',
	exportAs: 'AccordionControl',
	host: {
		role: 'tablist',
		'[attr.aria-multiselectable]': '!closeOtherPanels',
		class: 'accordion'
	},
	templateUrl: './accordion-control.component.html',
	styles: [`
		.accordion--animation {
			overflow: hidden;
        	-webkit-transition: height .5s;
      		transition: height .5s;
		}
	`],
	changeDetection: ChangeDetectionStrategy.OnPush

})
export class AccordionControlComponent implements AfterContentChecked {
	@ContentChildren(AccordionControlPanelDirective) panels: QueryList<AccordionControlPanelDirective>;

	/**
	 * An array or comma separated strings of panel identifiers that should be opened
	 */
	@Input() activeIds: string | string[] = [];
	@Input() hasAnimation = false;

	/**
	 *  Whether the other panels should be closed when a panel is opened
	 */
	@Input() closeOthers: boolean;

	/**
	 * Whether the closed panels should be hidden without destroying them
	 */
	@Input() destroyOnHide = true;

	/**
	 *  Accordion's types of panels to be applied globally.
	 *  Bootstrap recognizes the following types: "primary", "secondary", "success", "danger", "warning", "info", "light"
	 * and "dark
	 */
	@Input() type: string;

	/**
	 * A panel change event fired right before the panel toggle happens. See PanelChangeEvent for payload details
	 */
	@Output() panelChange = new EventEmitter<AccordionControlPanelChangeEvent>();

	constructor() {

	}

	/**
	 * Programmatically toggle a panel with a given id.
	 */
	toggle(panelId: string, accordionBodyScrollHeight) {
		const panel = this.panels.find(p => p.id === panelId);

		if (panel && !panel.disabled) {
			let defaultPrevented = false;
			if (this.hasAnimation) {
				panel.height = panel.height  ? 0 : panel.contentHeight;
			}

			this.panelChange.emit(
				{ panelId, nextState: !panel.isOpen, preventDefault: () => { defaultPrevented = true; } });

			if (!defaultPrevented) {
				panel.isOpen = !panel.isOpen;

				if (this.closeOthers) {
					this._closeOthers(panelId);
				}
				this._updateActiveIds();
			}
		}
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * after content checked
	 */
	ngAfterContentChecked() {
		// active id updates
		if (typeof this.activeIds === 'string') {
			this.activeIds = this.activeIds.split(/\s*,\s*/);
		}

		// update panels open states
		this.panels.forEach(panel => {
			panel.isOpen = !panel.disabled && this.activeIds.indexOf(panel.id) > -1;
			if (this.hasAnimation) {
				const domPanel = document.getElementById(panel.id);
				panel.contentHeight = domPanel && domPanel.scrollHeight ? domPanel.scrollHeight : 200;
			}
		});

		// closeOthers updates
		if (this.activeIds.length > 1 && this.closeOthers) {
			this._closeOthers(this.activeIds[0]);
			this._updateActiveIds();
		}
	}

	/**
	 * Close all panel except selected
	 * @param panelId: string
	 */
	private _closeOthers(panelId: string) {
		this.panels.forEach(panel => {
			if (panel.id !== panelId) {
				panel.isOpen = false;
			}
		});
	}

	/**
	 * Update active ids
	 */
	private _updateActiveIds() {
		this.activeIds = this.panels.filter(panel => panel.isOpen && !panel.disabled).map(panel => panel.id);
	}
}

