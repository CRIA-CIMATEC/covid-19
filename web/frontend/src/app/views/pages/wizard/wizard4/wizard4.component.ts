import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
	selector: 'kt-wizard4',
	templateUrl: './wizard4.component.html',
	styleUrls: ['./wizard4.component.scss']
})
export class Wizard4Component implements OnInit, AfterViewInit {

	@ViewChild('wizard', {static: true}) el: ElementRef;

	model: any = {
		fname: 'John',
		lname: 'Wick',
		phone: '+61412345678',
		email: 'john.wick@reeves.com',
		address1: 'Address Line 1',
		address2: 'Address Line 2',
		postcode: '3000',
		city: 'Melbourne',
		state: 'VIC',
		country: 'AU',
		delivery: 'overnight',
		packaging: 'regular',
		preferreddelivery: 'morning',
		locaddress1: 'Address Line 1',
		locaddress2: 'Address Line 2',
		locpostcode: '3072',
		loccity: 'Preston',
		locstate: 'VIC',
		loccountry: 'AU',
		ccname: 'John Wick',
		ccnumber: '4444 3333 2222 1111',
		ccmonth: '01',
		ccyear: '21',
		cccvv: '123',
	};
	submitted = false;

	constructor() {
	}

	ngOnInit() {
	}

	ngAfterViewInit(): void {
		// Initialize form wizard
		const wizard = new KTWizard(this.el.nativeElement, {
			startStep: 1
		});

		// Validation before going to next page
		wizard.on('beforeNext', (wizardObj) => {
			// https://angular.io/guide/forms
			// https://angular.io/guide/form-validation

			// validate the form and use below function to stop the wizard's step
			// wizardObj.stop();
		});

		// Change event
		wizard.on('change', (wizard) => {
			setTimeout(() => {
				KTUtil.scrollTop();
			}, 500);
		});
	}

	onSubmit() {
		this.submitted = true;
	}
}
