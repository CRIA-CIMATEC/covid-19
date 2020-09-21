import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContatoComponent } from './contato.component';
import { PartialsModule } from '../../partials/partials.module';
import { CoreModule } from '../../../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { from } from 'rxjs';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material';



@NgModule({
  declarations: [ContatoComponent],
  imports: [
    CommonModule,
    PartialsModule,
    ReactiveFormsModule,
    CoreModule,
    FormsModule,
    MatSlideToggleModule,
    TranslateModule.forChild(),
    RouterModule.forChild(
      [
        {
          path: '',
          component: ContatoComponent
        }
      ]
    )
  ]
})
export class ContatoModule { }
