import {SelectionModel} from '@angular/cdk/collections';
import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import { SimulationService } from '../../../../../services/simulation.service';

import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';
import { TranslationService } from '../../../../../core/_base/layout';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';


export interface Mitigation {
  name: string;
  //description: string;
}

/**
 * @title Table with selection
 */
@Component({
  selector: 'table-with-selection',
  styleUrls: ['table_with_selection.component.scss'],
  templateUrl: 'table_with_selection.component.html',
})
export class TableSelectionComponent implements OnInit {
  dataSource: any;
  ELEMENT_DATA: any;

  constructor(simulationService: SimulationService,private translationService: TranslationService,
    private translateService: TranslateService) {
    this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);

    this.ELEMENT_DATA = [
      {name: this.translateService.instant('MITIGACAO.school_closure')},
      {name: this.translateService.instant('MITIGACAO.workplace_closure')},
      {name: this.translateService.instant('MITIGACAO.cancellation_of_public_events')},
      {name: this.translateService.instant('MITIGACAO.restrictions_on_gathering_size')},
      {name: this.translateService.instant('MITIGACAO.public_transport_closures')},
      {name: this.translateService.instant('MITIGACAO.stay_at_home_requirements')},
      {name: this.translateService.instant('MITIGACAO.restrictions_on_domestic_movement')},
      {name: this.translateService.instant('MITIGACAO.restrictions_on_international_travel')},
    ];
    this.dataSource = new MatTableDataSource<Mitigation>(this.ELEMENT_DATA);
  }
  displayedColumns: string[] = ['select', 'name'];
  
  selection = new SelectionModel<Mitigation>(true, []);
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Mitigation): string {
    
    SimulationService.SchoolClosure = this.selection.selected[0] !== undefined ? true : false
    SimulationService.WorkplaceClosure = this.selection.selected[1] !== undefined ? true : false
    SimulationService.CancellationOfPublicEvents = this.selection.selected[2] !== undefined ? true : false
    SimulationService.RestrictionsOnGatheringSize = this.selection.selected[3] !== undefined ? true : false
    SimulationService.PublicTransportClosures = this.selection.selected[4] !== undefined ? true : false
    SimulationService.RestrictionsOnDomesticMovement = this.selection.selected[5] !== undefined ? true : false
    SimulationService.StayAtHomeRequirements = this.selection.selected[6] !== undefined ? true : false
    SimulationService.RestrictionsOnInternationalTravel = this.selection.selected[7] !== undefined ? true : false
    
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }

  ngOnInit(){
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      // console.log("change lang")
      this.ELEMENT_DATA = [
        {name: this.translateService.instant('MITIGACAO.school_closure')},
        {name: this.translateService.instant('MITIGACAO.workplace_closure')},
        {name: this.translateService.instant('MITIGACAO.cancellation_of_public_events')},
        {name: this.translateService.instant('MITIGACAO.restrictions_on_gathering_size')},
        {name: this.translateService.instant('MITIGACAO.public_transport_closures')},
        {name: this.translateService.instant('MITIGACAO.stay_at_home_requirements')},
        {name: this.translateService.instant('MITIGACAO.restrictions_on_domestic_movement')},
        {name: this.translateService.instant('MITIGACAO.restrictions_on_international_travel')},
      ];
      
      this.dataSource = new MatTableDataSource<Mitigation>(this.ELEMENT_DATA);
      
      
    })
  }

  
}
