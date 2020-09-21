// Angular
import { Component, Input } from '@angular/core';

export interface ISearchResult {
	icon: string;
	img: string;
	title: string;
	text: string;
	url: string;
}

@Component({
	selector: 'kt-search-result',
	templateUrl: './search-result.component.html',
	styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent {
	// Public properties
	@Input() data: ISearchResult[];
	@Input() noRecordText: string;
}
