declare module 'formidable' {
  interface File {
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    size?: number;
  }

  interface Options {
    maxFileSize?: number;
    allowEmptyFiles?: boolean;
  }

  interface Files {
    [key: string]: File | File[];
  }

  interface Fields {
    [key: string]: string | string[];
  }

  type Callback = (err: any, fields: Fields, files: Files) => void;

  interface IncomingForm {
    parse: (req: any, cb: Callback) => void;
  }

  interface FormidableConstructor {
    (options?: Options): IncomingForm;
  }

  const formidable: FormidableConstructor;
  export default formidable;
}
