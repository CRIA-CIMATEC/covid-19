// Angular
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
// Config
import { AccordionControlConfig } from './accordion-control.config';

import {
	AccordionControlComponent,
	AccordionControlPanelDirective,
	AccordionControlPanelTitleDirective,
	AccordionControlPanelContentDirective} from './accordion-control.component';

export { AccordionControlConfig} from './accordion-control.config';
export {
	AccordionControlComponent, AccordionControlPanelDirective, AccordionControlPanelTitleDirective,
	AccordionControlPanelContentDirective, AccordionControlPanelChangeEvent
} from './accordion-control.component';

const ACCORDION_CONTROL_DIRECTIVES = [
	AccordionControlComponent,
	AccordionControlPanelDirective,
	AccordionControlPanelTitleDirective,
	AccordionControlPanelContentDirective
];

@NgModule({
	imports: [
		CommonModule
	],
	exports: ACCORDION_CONTROL_DIRECTIVES,
	declarations: ACCORDION_CONTROL_DIRECTIVES
})
export class AccordionControlModule {
	static forRoot(): ModuleWithProviders {
		return { ngModule: AccordionControlModule, providers: [AccordionControlConfig] };
	}
}
