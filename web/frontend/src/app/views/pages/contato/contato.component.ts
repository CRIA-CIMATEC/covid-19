import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslationService, LayoutConfigService } from '../../../core/_base/layout';

// Languages
import { locale as enLang } from '../../../core/_config/i18n/en';
import { locale as ptLang } from '../../../core/_config/i18n/pt';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ContatoService } from '../../../services/contato.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'kt-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.scss']
})
export class ContatoComponent implements OnInit {
  clear: any;

  hasFormErrors = false;
  submitSuccess = false;

  form = new FormGroup(
    {
      nome: new FormControl(''),
      email: new FormControl(''),
      mensagem: new FormControl(''),
      sugestao: new FormControl('')
    }
  );

  public formErrors = {
    nome: '',
    email: '',
    mensagem: ''
  }
  public submitMsg = '';

  public validationMessages = {
    nome: {
      required: this.translateService.instant('FORM.VALIDATION.REQUIRED')
    },
    email: { 
      required: this.translateService.instant('FORM.VALIDATION.REQUIRED'),
      email: this.translateService.instant('FORM.VALIDATION.INVALID')
    },
    mensagem: {
      required: this.translateService.instant('FORM.VALIDATION.REQUIRED')
    }
  }

  constructor(
    private translationService: TranslationService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private contatoService: ContatoService,
    private _cdr: ChangeDetectorRef
  ) {
    this.translationService.loadTranslations(
      enLang,
      ptLang
    )
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group(
      {
        nome: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        mensagem: ['', [Validators.required]],
        sugestao: ['true']
      }
    );
    this.form.valueChanges.subscribe( data => this.onValueChanged(data) );
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.form) { return; }

    const form = this.form;
    for(const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];

        for (const key in control.errors) {
            this.formErrors[field] = messages[key];
            break;
        }
      }
    }
  }

  submit() {
		if(!this.form.valid){
      const form = this.form;
      for (const field in this.formErrors) {
        this.formErrors[field] = '';              
        const control = form.get(field);
        if (control && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            this.formErrors[field] = messages[key];
            this.submitMsg = messages[key];
            this.submitSuccess = false;
            this._cdr.detectChanges();
            break;
          }
        }
      }
      this.hasFormErrors = true;
      return;
    }
    this.contatoService.submit(this.form.value)
      .subscribe((response: HttpResponse<any>) => {
        // console.log(response);
        if (response.status == 202) {
          this.submitMsg = this.translateService.instant('FORM.SUBMIT_SUCCESS');
          this.form.reset();
          this.submitSuccess = true;
          this._cdr.detectChanges();
        }
      });
  }
  
  /** Alect Close event */
	onAlertClose() {
    this.hasFormErrors = false;
		this.submitSuccess = false;
	}

}
