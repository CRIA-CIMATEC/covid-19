// Angular
import {Injectable} from '@angular/core';

/**
 * Configuration service for the MAccordionControl component.
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the accordions used in the application.
 */
@Injectable()
export class AccordionControlConfig {
	closeOthers = false;
  type: string;
}
