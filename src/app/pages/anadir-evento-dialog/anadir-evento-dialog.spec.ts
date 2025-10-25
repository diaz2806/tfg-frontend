import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnadirEventoDialogComponent } from './anadir-evento-dialog';

describe('AnadirEventoDialogComponent', () => {
  let component: AnadirEventoDialogComponent;
  let fixture: ComponentFixture<AnadirEventoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnadirEventoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnadirEventoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
