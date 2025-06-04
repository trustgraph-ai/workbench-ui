
export const textToBase64 = (input) => {
  return btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode("0x" + p1);
    }),
  );
};

export const fileToBase64 = (file) => {

    return new Promise(
        (resolve) => {

            const reader = new FileReader();
            

            reader.onloadend = () => {

                // FIXME: Type is 'string | ArrayBuffer'?  is this safe?
                // FIXME: Use Blob.arrayBuffer API?
                const data = (reader.result as string)
                                 .replace("data:", "")
                                 .replace(/^.+,/, "");

                resolve(data);

            }

          reader.readAsDataURL(file);

        }

    );

}



    
