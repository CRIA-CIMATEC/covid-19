import { TestBed } from '@angular/core/testing';

import { MembrosService } from './membros.service';

describe('MembrosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MembrosService = TestBed.get(MembrosService);
    expect(service).toBeTruthy();
  });
});

