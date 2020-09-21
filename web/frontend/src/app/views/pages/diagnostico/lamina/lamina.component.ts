import { Injector, Component } from '@angular/core';
import { DiagnosticoComponent } from '../diagnostico.component';

@Component({
	selector: 'kt-diagnostico',
	templateUrl: '../diagnostico.component.html',
	styleUrls: ['../diagnostico.component.scss'],
})
export class LaminaComponent extends DiagnosticoComponent {
  title = 'MENU.DIAGNOSTICO_LAMINA_TOMOGRAFIA';
  descricao = 'DASHBOARD.DIAGNOSTICOS_DESC_LAMINA';
  inputType = 'Lamina';
  IsLamina = true;

  constructor(injector: Injector) {
    super(injector);
  }

}
