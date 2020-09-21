import { TestBed } from '@angular/core/testing';

import { ContatoService } from './contato.service';

describe('ContatoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContatoService = TestBed.get(ContatoService);
    expect(service).toBeTruthy();
  });
});
