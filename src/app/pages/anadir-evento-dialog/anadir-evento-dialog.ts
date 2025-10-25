import { Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-anadir-evento-dialog',
  imports: [MatDialogActions, MatInputModule, MatDialogContent, ReactiveFormsModule],
  templateUrl: './anadir-evento-dialog.html',
  styleUrl: './anadir-evento-dialog.css',
})
export class AnadirEventoDialogComponent {
  eventForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AnadirEventoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.eventForm = this.fb.group({
      title: [data?.title || '', Validators.required],
      start: [data?.start || '', Validators.required],
      end: [data?.end || ''],
    });
  }

  save() {
    if (this.eventForm.valid) {
      this.dialogRef.close(this.eventForm.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
