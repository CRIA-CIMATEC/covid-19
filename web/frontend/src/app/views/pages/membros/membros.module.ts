import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembrosComponent } from './membros.component';
import { PartialsModule } from '../../partials/partials.module';
import { CoreModule } from '../../../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [MembrosComponent],
  imports: [
    CommonModule,
    PartialsModule,
    CoreModule,
    TranslateModule.forChild(),
    RouterModule.forChild(
      [
        {
          path: '',
          component: MembrosComponent
        }
      ]
    )
  ]
})
export class MembrosModule { }
