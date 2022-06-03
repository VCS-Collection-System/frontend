import { 
    accessibleRouteChangeHandler, 
    convertBlobToBase64, 
    convertBase64ToBlob, 
    dateConvert, 
    dateConvert2, 
    americanDateFormat,
    birthDateValidator,
    birthDateRules,
    covidTestDateValidator,
    covidTestDateRules,
    covidVaxOneDateRules,
    covidVaxDateValidator,
    covidVaxDateRules
} from "@app/utils/utils";

describe('accessibleRouteChangeHandler', ()=> {
    it('should not return null', async () => {
        const handler = accessibleRouteChangeHandler();
        expect(handler).not.toBeNull();
    });

    it('no main container', async () => {
        jest.useFakeTimers();
        accessibleRouteChangeHandler();
        jest.runAllTimers();
    });

    it('focus is called', async () => {
        const mockFocus = jest.fn()
        const mockElement = document.createElement("mockElement"); 
        mockElement.focus = mockFocus
        jest.spyOn(document, 'getElementById').mockReturnValue(mockElement)
        jest.useFakeTimers();
        accessibleRouteChangeHandler();
        jest.runAllTimers();
        expect(mockFocus).toBeCalled();
    });
});


describe('convertBlobToBase64', ()=> {
    it('returns a Promise', () => {
        const base64Image = "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg";
        const blob = convertBase64ToBlob(base64Image);
        const result = convertBlobToBase64(blob);
        expect(result).toBeInstanceOf(Promise);
        expect(convertBlobToBase64(blob)).resolves.toContain(base64Image);
    })
});

describe('convertBase64ToBlob', ()=> {
    it('returns a blob', () => {
        const base64Image = "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg";
        const result = convertBase64ToBlob(base64Image);
        expect(result).toBeInstanceOf(Blob);
    })
});

describe('dateConvert', ()=> {
    it('empty date', async ()=> {
        expect(dateConvert("")).toEqual("");
    });
    it('YYYY-MM-DD', async ()=> {
        expect(dateConvert("2021-09-28")).toEqual("09-28-2021");
        expect(dateConvert("2021-9-5")).toEqual("09-05-2021");
    });
    it('MM-DD-YYYY', async ()=> {
        expect(dateConvert("09-28-2021")).toEqual("2021-09-28");
    });  

})

describe('dateConvert2', ()=> {
    it('empty date', async ()=> {
        expect(dateConvert2("")).toEqual("");
    });
    it('YYYY-DD-MM', async ()=> {
        expect(dateConvert2("2021-28-09")).toEqual("09-28-2021");
        expect(dateConvert2("2021-9-5")).toEqual("05-09-2021");
    });
    it('MM-DD-YYYY', async ()=> {
        expect(dateConvert2("09-28-2021")).toEqual("2021-09-28");
    });  

})

describe('americanDateFormat', ()=> {
    it('negative test', async ()=> {
        const testResult = americanDateFormat("bad").toString()
        const expectedResult = (new Date()).toString()
        expect(testResult).toEqual(expectedResult)
    })  
})

describe('americanDateFormat', ()=> {
    it('valid test', async ()=> {
        const testResult = americanDateFormat("01-30-2021").toString()
        const expectedResult = new Date(`2021-01-30T00:00:00`).toString()
        expect(testResult).toEqual(expectedResult)
    })  
})

describe('birthDateValidator', ()=> {
    it('born today is okay', async ()=> {
        const expectedResult = ""
        const testDate = new Date()
        const testResult = birthDateValidator(testDate)
        expect(testResult).toEqual(expectedResult)
    })  
    it('born 01-01-1921 is okay', async ()=> {
        const expectedResult = ""
        const testDate = new Date("01-01-1921")
        const testResult = birthDateValidator(testDate)
        expect(testResult).toEqual(expectedResult)
    })  
    it('born 12-31-1920 is not okay', async ()=> {
        const expectedResult = "Birth year cannot be earlier than 01-01-1921."
        const testDate = new Date("12-31-1920")
        const testResult = birthDateValidator(testDate)
        expect(testResult).toEqual(expectedResult)
    })  
    it('born tomorrow is not okay', async ()=> {
        const expectedResult = "Date cannot be in the future, please choose another."
        let testDate = new Date()
        testDate.setDate(testDate.getDate() + 1)
        const testResult = birthDateValidator(testDate)
        expect(testResult).toEqual(expectedResult)
    })  
    it('negative test', async ()=> {
        const expectedResult = ""
        const testDate = ""
        const testResult = birthDateValidator(testDate)
        expect(testResult).toEqual(expectedResult)
    })  
})

describe('birthDateRules', ()=> {
    it('born today this year is okay', async ()=> {
        const expectedResult = true
        const testResult = birthDateRules("01-01-2021")
        expect(testResult).toEqual(expectedResult)
    })  
    it('born tomorrow is not okay', async ()=> {
        const expectedResult = false
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const testResult = birthDateRules(tomorrow.toString())
        expect(testResult).toEqual(expectedResult)
    })  
    it('born 01/01/1921 is okay', async ()=> {
        const expectedResult = true
        const testResult = birthDateRules("01/01/1921")
        expect(testResult).toEqual(expectedResult)
    })  
    it('born 12/31/1920 is not okay', async ()=> {
        const expectedResult = false
        const testResult = birthDateRules("12/31/1920")
        expect(testResult).toEqual(expectedResult)
    })  
  })  

  describe('covidTestDateValidator', ()=> {
    it('today is okay', async ()=> {
        const expectedResult = ""
        const testResult = covidTestDateValidator(new Date())
        expect(testResult).toEqual(expectedResult)
    })  
    it('tomorrow is not okay', async ()=> {
        const expectedResult = "Date cannot be in the future, please choose another."
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const testResult = covidTestDateValidator(tomorrow)
        expect(testResult).toEqual(expectedResult)
    })  
    it('Earlier than 08-01-2021 is not okay', async ()=> {
        const expectedResult = "Test result date cannot be earlier than 08-01-2021."
        const nope = new Date("07-31-2021")
        const testResult = covidTestDateValidator(nope)
        expect(testResult).toEqual(expectedResult)
    })  
  })  

  describe('covidTestDateRules', ()=> {
    it('simple date 2020-05-01 is not okay', async ()=> {
        const expectedResult = false
        const testResult = covidTestDateRules("2020-05-01")
        expect(testResult).toEqual(expectedResult)
    })  
    it('future is not okay', async ()=> {
        const expectedResult = false
        const testResult = covidTestDateRules("2999-01-01")
        expect(testResult).toEqual(expectedResult)
    })  
  })  

  describe('covidVaxOneDateRules', ()=> {
    it('simple date 2020-05-01 and earliest date 2020/04/01 is okay', async ()=> {
        const expectedResult = true
        const covidResult = covidVaxOneDateRules("2020-05-01", "2020/04/01")
        expect(covidResult).toEqual(expectedResult)
    })  
    it('simple date 2020-05-01 and earliest date 2020/05/02 is not okay', async ()=> {
        const expectedResult = false
        const covidResult = covidVaxOneDateRules("2020-05-01", "2020/05/02")
        expect(covidResult).toEqual(expectedResult)
    })  
    it('future is not okay', async ()=> {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const expectedResult = false
        const covidResult = covidVaxOneDateRules(tomorrow.toDateString(), "2020/05/01")
        expect(covidResult).toEqual(expectedResult)
    })  
  })  

  describe('covidVaxDateValidator', ()=> {
    it('future is not okay', () => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const expectedResult = "Date cannot be in the future, please choose another."
        const covidResult = covidVaxDateValidator(tomorrow, "", "")
        expect(covidResult).toEqual(expectedResult)
    })  
    it('Vaccination date cannot be earlier than 06-01-2020', () => {
        const date = new Date("2020/05/01")
        const minDate = new Date("2020/06/01")
        const expectedResult = "Vaccination date cannot be earlier than 06-01-2020."
        const covidResult = covidVaxDateValidator(date, minDate, "")
        expect(covidResult).toEqual(expectedResult)
    })  
    it("Second shot date must be after the first shot date", () => {
        const date = new Date("2020/09/01")
        const minDate = new Date("2020/06/01")
        const shotOneDate = new Date("2020/10/01")
        const expectedResult = "Second shot date must be after the first shot date."
        const covidResult = covidVaxDateValidator(date, minDate, shotOneDate)
        expect(covidResult).toEqual(expectedResult)
    })  
    it("All valid dates should return empty", () => {
        const date = new Date("2020/11/01")
        const minDate = new Date("2020/06/01")
        const shotOneDate = new Date("2020/10/01")
        const expectedResult = ""
        const covidResult = covidVaxDateValidator(date, minDate, shotOneDate)
        expect(covidResult).toEqual(expectedResult)
    }) 
  })  

  describe('covidVaxDateRules', ()=> {
    it('Having previous shot is okay', () => {
        const today = new Date()
        const expectedResult = true
        const covidResult = covidVaxDateRules("", "", today)
        expect(covidResult).toEqual(expectedResult)
    })  
    it('Having one shot is okay', () => {
        const date = "2020/11/01"
        const minDate = "2020/06/01"
        const expectedResult = true
        const covidResult = covidVaxDateRules(date, minDate, "")
        expect(covidResult).toEqual(expectedResult)
    })  
    it('Shot must be later than 2020/06/01', () => {
        const date = "2020/05/01"
        const minDate = "2020/06/01"
        const expectedResult = false
        const covidResult = covidVaxDateRules(date, minDate, "")
        expect(covidResult).toEqual(expectedResult)
    }) 
    it('future is not okay', () => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const minDate = "2020/06/01"
        const expectedResult = false
        const covidResult = covidVaxDateRules(tomorrow.toDateString(), minDate, "")
        expect(covidResult).toEqual(expectedResult)
    }) 
    it('Having all valid dates', () => {
        const date = "2020/11/01"
        const minDate = "2020/06/01"
        const shotOneDate = "2020/10/01"
        const expectedResult = true
        const covidResult = covidVaxDateRules(date, minDate, shotOneDate)
        expect(covidResult).toEqual(expectedResult)
    })  
    it('Must be earlier than previous shot', () => {
        const date = "2020/09/01"
        const minDate = "2020/06/01"
        const shotOneDate = "2020/10/01"
        const expectedResult = false
        const covidResult = covidVaxDateRules(date, minDate, shotOneDate)
        expect(covidResult).toEqual(expectedResult)
    })  
  })  