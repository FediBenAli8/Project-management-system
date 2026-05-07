import * as UC from '@uploadcare/file-uploader';
import "@uploadcare/file-uploader/web/uc-file-uploader-regular.min.css"
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

UC.defineComponents(UC);

@Component({
  selector: 'file-uploader',
  standalone: true,
  imports: [],
  templateUrl: './fule-uploader.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FuleUploader {
  @Output() onUploadComplete = new EventEmitter<string>();
  handleChangeEvent(e: any) {
    // Look at all the files currently in the widget
    const files = e.detail.allEntries;

    // Find the one that successfully finished uploading
    const successFile = files.find((f: any) => f.status === 'success');

    if (successFile && successFile.cdnUrl) {
      console.log('Uploadcare finished! URL:', successFile.cdnUrl);

      // Emit the URL to your Register component
      this.onUploadComplete.emit(successFile.cdnUrl);
    }
  }
}