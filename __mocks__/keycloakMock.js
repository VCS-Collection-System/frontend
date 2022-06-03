module.exports = {
    token: "bogustoken", 
    authenticated: false,
    loadUserProfile: jest.fn( ()=> {return Promise.resolve({
        attributes: {
            workforceid: ["mockId"]
        }
    })} ),
    login: jest.fn(),
    logout: jest.fn(),
    hasRealmRole: jest.fn(),
    profile: {
        firstName: "mockFirst",
        lastName: "mockLast",
        email: "mock@email.com",
        attributes: {
            workforceid: ["mockId"],
            agency: ["USA"]
        }
    }
};
