import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LayoutConfigService, TranslationService } from '../../../../../core/_base/layout';
import { DashboardService } from '../../../../../services/dashboard.service';
import { CenarioService } from '../../../../../services/cenario.service';
import { SimulationService } from '../../../../../services/simulation.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';
 
@Component({
	selector: 'metigation_recovery',
	templateUrl: './metigation_recovery.component.html',
    styleUrls: ['metigation_recovery.component.scss'],
})

export class MetigationRecoveryComponent implements OnInit { 
  school: any;
  public: any;
  domestic: any;
  transport: any;
  gather: any;
  travel: any;
  stay: any;
  work: any;
  
    
  constructor(
    private layoutConfigService: LayoutConfigService,
    private translationService: TranslationService,
    private dashboardService: DashboardService,
    private simulationService: SimulationService,
    private cenarioService: CenarioService,
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private _changeDetectorRef: ChangeDetectorRef
) { 
    this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
}


ngAfterViewInit(){
  this.setAll
}

ngOnInit(){
  CenarioService.ResponseModerate.subscribe(
    a => this.getMatselect(a)
  )
  this.setAll;
}
getMatselect(obj?){
  let resp = obj.Mitigacao;
  // console.log(School_Closure);
var CancellationOfPublicEvents = resp.CancellationOfPublicEvents;
var Public_Closures = resp.PublicTransportClosures;
var Restriction_Movement = resp.RestrictionsOnDomesticMovement;
var Restriction_Size = resp.RestrictionsOnGatheringSize;
var Restriction_Travel = resp.RestrictionsOnInternationalTravel;
var School_Closure = resp.SchoolClosure;
var Stay_Requirements = resp.StayAtHomeRequirements;
var Workplace_Closure = resp.WorkplaceClosure;

this.setAll(CancellationOfPublicEvents, Public_Closures, Restriction_Movement, Restriction_Size, Restriction_Travel, School_Closure,Stay_Requirements, Workplace_Closure)
}
setAll(CancellationOfPublicEvents, Public_Closures, Restriction_Movement, Restriction_Size, Restriction_Travel, School_Closure,Stay_Requirements, Workplace_Closure) {
// console.log()
this.school =  School_Closure;
this.public =  CancellationOfPublicEvents;
this.domestic =  Restriction_Movement;
this.transport =  Public_Closures;
this.gather =  Restriction_Size;
this.travel =  Restriction_Travel;
this.stay =  Stay_Requirements;
this.work =  Workplace_Closure;

}
}