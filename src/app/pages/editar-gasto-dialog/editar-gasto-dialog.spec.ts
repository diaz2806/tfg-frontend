import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarGastoDialogComponent } from './editar-gasto-dialog';

describe('EditarGastoDialog', () => {
  let component: EditarGastoDialogComponent;
  let fixture: ComponentFixture<EditarGastoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarGastoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarGastoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
