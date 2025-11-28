import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPerfilDialog } from './editar-perfil-dialog';

describe('EditarPerfilDialog', () => {
  let component: EditarPerfilDialog;
  let fixture: ComponentFixture<EditarPerfilDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPerfilDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPerfilDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
