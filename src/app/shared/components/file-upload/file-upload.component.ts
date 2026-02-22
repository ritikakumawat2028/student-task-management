import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() accept: string = '*';
  @Input() maxSize: number = 10; // in MB
  @Input() currentFile: string | null = null;
  @Input() label: string = 'Upload File';
  @Output() fileSelect = new EventEmitter<{ file: File | null; dataUrl: string | null }>();

  isDragging = false;
  preview: string | null = null;
  fileName: string = '';
  fileType: string = '';

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    if (this.currentFile) {
      this.preview = this.currentFile;
    }
  }

  handleFile(file: File): void {
    // Check file size
    if (file.size > this.maxSize * 1024 * 1024) {
      this.snackBar.open(`File size must be less than ${this.maxSize}MB`, 'Close', { duration: 3000 });
      return;
    }

    this.fileName = file.name;
    this.fileType = file.type;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.preview = dataUrl;
      this.fileSelect.emit({ file, dataUrl });
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onRemove(): void {
    this.preview = null;
    this.fileName = '';
    this.fileType = '';
    this.fileSelect.emit({ file: null, dataUrl: null });
  }

  getFileIcon(): string {
    if (this.fileType.startsWith('image/')) {
      return 'image';
    } else if (this.fileType.includes('pdf')) {
      return 'picture_as_pdf';
    } else {
      return 'insert_drive_file';
    }
  }

  get isImage(): boolean {
    return this.fileType.startsWith('image/');
  }
}
