import { Injector, Component } from '@angular/core';
import { DiagnosticoComponent } from '../diagnostico.component';

@Component({
	selector: 'kt-diagnostico',
	templateUrl: '../diagnostico.component.html',
	styleUrls: ['../diagnostico.component.scss'],
})
export class RaioxComponent extends DiagnosticoComponent {
  title = 'MENU.DIAGNOSTICO_RAIO_X';
  descricao = 'DASHBOARD.DIAGNOSTICOS_DESC_RAIOX';
  inputType = 'RaioX';

  constructor(injector: Injector) {
    super(injector);
  }

}
