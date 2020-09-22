import { Component, OnInit, Input } from '@angular/core';
import { TranslationService } from '../../../core/_base/layout';

import { MembrosService } from '../../../services/membros.service';

// Languages
import { locale as enLang } from '../../../core/_config/i18n/en';
import { locale as ptLang } from '../../../core/_config/i18n/pt';

@Component({
  selector: 'kt-membros',
  templateUrl: './membros.component.html',
  styleUrls: ['./membros.component.scss']
})
export class MembrosComponent implements OnInit {
  clear: any;

  @Input() membros: any[];

  constructor(
    private membrosService: MembrosService,
    private translationService: TranslationService
  ) { 
    this.translationService.loadTranslations(
      enLang,
      ptLang
    )
  }

  ngOnInit() {
    this.membros = [
      {
        nome:'Nome do Membro 01',
        descricao: 'Descrição do Membro 01',
        lattes: 'URL Lattes do Membro 01',
        foto: 'Base64 da foto do Membro 01'
      },
      {
        nome:'Nome do Membro 02',
        descricao: 'Descrição do Membro 02',
        lattes: 'URL Lattes do Membro 02',
        foto: 'Base64 da foto do Membro 02'
      },
      {
        nome:'Nome do Membro 03',
        descricao: 'Descrição do Membro 03',
        lattes: 'URL Lattes do Membro 03',
        foto: 'Base64 da foto do Membro 03'
      },
      {
        nome:'Nome do Membro 04',
        descricao: 'Descrição do Membro 04',
        lattes: 'URL Lattes do Membro 04',
        foto: 'Base64 da foto do Membro 04'
      },
      {
        nome:'Nome do Membro 05',
        descricao: 'Descrição do Membro 05',
        lattes: 'URL Lattes do Membro 05',
        foto: 'Base64 da foto do Membro 05'
        
      }
    ]
    this.membrosService.getAll().subscribe(data => {this.membros = data});
  }

}
