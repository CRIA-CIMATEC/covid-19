import { TestBed } from '@angular/core/testing';

import { CenarioService } from './cenario.service';

describe('CenarioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CenarioService = TestBed.get(CenarioService);
    expect(service).toBeTruthy();
  });
});
