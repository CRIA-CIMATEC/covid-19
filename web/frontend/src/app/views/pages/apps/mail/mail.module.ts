// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// Component
import { MailComponent } from './mail.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: MailComponent
			}
		])
	],
	declarations: [MailComponent]
})
export class MailModule {}
