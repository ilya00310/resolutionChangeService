export const newPermissionSchema = {
  width: {
    isInt: {
      options: { min: 21 },
      errorMessage: 'Width must be an integer greater than 20',
    },
    custom: {
      options: (value) => {
        if (value % 2 !== 0) {
          throw new Error('Width must be an even number');
        }
        return true;
      },
    },
  },
  height: {
    isInt: {
      options: { min: 21 },
      errorMessage: 'Height must be an integer greater than 20',
    },
    custom: {
      options: (value) => {
        if (value % 2 !== 0) {
          throw new Error('Height must be an even number');
        }
        return true;
      },
    },
  },
}