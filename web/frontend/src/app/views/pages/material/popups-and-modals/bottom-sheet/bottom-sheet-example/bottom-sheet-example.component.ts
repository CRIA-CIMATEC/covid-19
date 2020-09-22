import { Component } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';


@Component({
	selector: 'kt-bottom-sheet-example',
	templateUrl: './bottom-sheet-example.component.html'
})
export class BottomSheetExampleComponent {
	constructor(private bottomSheetRef: MatBottomSheetRef<BottomSheetExampleComponent>) {}

	openLink(event: MouseEvent): void {
	  this.bottomSheetRef.dismiss();
	  event.preventDefault();
	}
}
