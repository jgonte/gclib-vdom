import displayObject from "../src/utils/displayObject";

describe("displayObject tests", () => {

    it("displayObject undefined", () => {

        expect(displayObject(undefined)).toEqual('undefined');
    });

    it("displayObject null", () => {

        expect(displayObject(null)).toEqual('null');
    });

    it("displayObject string", () => {

        expect(displayObject('Some text')).toEqual("'Some text'");
    });

    it("displayObject number", () => {

        expect(displayObject(123)).toEqual('123');
    });

    it("displayObject boolean", () => {

        expect(displayObject(false)).toEqual('false');
    });

    it("displayObject empty", () => {

        expect(displayObject({})).toEqual(
            `
{}`
        );
    });

    it("displayObject simple attributes", () => {

        expect(displayObject({
            name: 'Sarah',
            age: 18,
            single: true
        })).toEqual(
            `
{
    name: 'Sarah',
    age: 18,
    single: true
}`
        );
    });

    it("displayObject empty array", () => {

        expect(displayObject([])).toEqual(
            `
[]`
        );
    });

    it("displayObject array of primitive types", () => {

        expect(displayObject([
            'Text',
            123,
            true
        ])).toEqual(
            `
[
    'Text',
    123,
    true
]`
        );
    });

    it("displayObject array of empty object", () => {

        const expected: string = `
[
    {}
]`;

        const actual: string = displayObject([{}]);

        expect(actual.replace(/\s/g, '')).toEqual(expected.replace(/\s/g, ''));
    });

    it("displayObject object", () => {

        const actual: string = displayObject({
            name: 'Sarah',
            age: 18,
            single: true,
            address: {
                street: 'Main 1',
                postalCode: 12345,
                area: {
                    state: 'Florida',
                    county: {
                        name: 'USA',
                        states: [
                            'Arkansas',
                            'Florida'
                        ]
                    }
                }
            },
            grades: [
                {
                    name: 'Math',
                    grade: 87,
                    passed: true,
                    subjects: [
                        'Calculus',
                        'Series'
                    ]
                },
                {
                    name: 'Spanish',
                    grade: 67,
                    passed: true,
                    subjects: [
                        'Reading',
                        'Writing'
                    ]
                }
            ]
        })

        const expected: string =
            `
{
    name: 'Sarah',
    age: 18,
    single: true,
    address:
    {
        street: 'Main 1',
        postalCode: 12345,
        area:
        {
            state: 'Florida',
            county:
            {
                name: 'USA',
                states:
                [
                    'Arkansas',
                    'Florida'
                ]
            }
        }
    },
    grades:
    [
        {
            name: 'Math',
            grade: 87,
            passed: true,
            subjects:
            [
                'Calculus',
                'Series'
            ]
        },
        {
            name: 'Spanish',
            grade: 67,
            passed: true,
            subjects:
            [
                'Reading',
                'Writing'
            ]
        }
    ]
}`;

        expect(actual.replace(/\s/g, '')).toEqual(expected.replace(/\s/g, ''));
    });

});