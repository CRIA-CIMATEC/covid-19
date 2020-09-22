import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatSnackBar } from '@angular/material';
import { PizzaPartyComponent } from '../../popups-and-modals/snackbar/pizza-party.component';


export class State {
	constructor(public name: string, public population: string, public flag: string) { }
}

@Component({
	selector: 'kt-default-forms',
	templateUrl: './default-forms.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: [`
	.example-container {
		display: flex;
		flex-direction: column;
	}
	.example-full-width {
		width: 100%;
	  }

	 .kt-checkbox-inline > mat-checkbox {
		 padding-right: 20px;
	 }
	`]
})
export class DefaultFormsComponent implements OnInit {
	stateCtrl: FormControl;
	filteredStates: Observable<any[]>;
	states: State[] = [
		{
			name: 'Arkansas',
			population: '2.978M',
			// https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
			flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg'
		},
		{
			name: 'California',
			population: '39.14M',
			// https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
			flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg'
		},
		{
			name: 'Florida',
			population: '20.27M',
			// https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
			flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg'
		},
		{
			name: 'Texas',
			population: '27.47M',
			// https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
			flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg'
		}
	];
	foods = [
		{ value: 'steak-0', viewValue: 'Steak' },
		{ value: 'pizza-1', viewValue: 'Pizza' },
		{ value: 'tacos-2', viewValue: 'Tacos' }
	];
	isHuman = true;
	isHuman2 = true;
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;

	// Enter, comma
	separatorKeysCodes = [ENTER, COMMA];

	fruits = [
		{ name: 'Pizza' },
		{ name: 'Steak' },
		{ name: 'Tacos' },
	];

	constructor(public snackBar: MatSnackBar) {
		this.stateCtrl = new FormControl();
		this.filteredStates = this.stateCtrl.valueChanges
			.pipe(
				startWith(''),
				map(state => state ? this.filterStates(state) : this.states.slice())
			);
	}

	ngOnInit() { }

	onChange(value) {
		this.isHuman = value.checked === true;
	}

	onChange2(value) {
		this.isHuman2 = value.checked === true;
	}

	filterStates(name: string) {
		return this.states.filter(state =>
			state.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
	}

	add(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our fruit
		if ((value || '').trim()) {
			this.fruits.push({ name: value.trim() });
		}

		// Reset the input value
		if (input) {
			input.value = '';
		}
	}

	remove(fruit: any): void {
		const index = this.fruits.indexOf(fruit);
		if (index >= 0) {
			this.fruits.splice(index, 1);
		}
	}

	openSnackBar() {
		this.snackBar.openFromComponent(PizzaPartyComponent, {
			duration: 500,
		});
	}
}

