import api, { route } from '@forge/api';
import Resolver from '@forge/resolver';


const resolver = new Resolver();


// resolver.define('getHoursOfWeek', (req) => {
//   console.log(req);

//   return '13';
// });
resolver.define('getHoursOfWeek', async (req) => {
  const { accountId } = req.payload;
  console.log('=== getHoursOfWeek called ===');
  console.log('Request payload:', req.payload);
  if (!accountId) {
    console.log('No accountId provided');
    return 0;
  }

  const jql = `assignee="${accountId}" AND duedate >= startOfWeek() AND duedate <= endOfWeek()`;
  console.log('JQL query:', jql);
  try {
    // Encode the JQL for URL
    const encodedJql = encodeURIComponent(jql);
    const url = `/rest/api/3/search?jql=${encodedJql}&fields=originalEstimate`;
    
    console.log('Request URL:', url);
    
    const response = await api.asUser().requestJira(route`/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql: jql,
        fields: ['originalEstimate']
      })
    });
    
    console.log('API response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!data.issues) {
      console.error('No issues array in response');
      return 0;
    }
    console.log('Issues:', data.issues);
    let totalHours = 0;
    data.issues.forEach(issue => {
      const budgetValue = issue.fields.originalEstimate;
      if (budgetValue) {
        totalHours += parseFloat(budgetValue);
      }
    });
      console.log('Total hours calculated:', totalHours);
      return totalHours;
  } catch (error) {
      console.error('Error fetching week hours:', error);
      return 0;
  }
});


// resolver.define('getHoursOfMonth', (req) => {
//   console.log(req);

//   return '37';
// });

resolver.define('getHoursOfMonth', async (req) => {
  const { accountId } = req.payload;
  console.log('=== getHoursOfMonth called ===');
  console.log('Request payload:', req.payload);
  
  if (!accountId) {
    console.log('No accountId provided');
    return 0;
  }

  const jql = `assignee="${accountId}" AND duedate >= startOfMonth() AND duedate <= endOfMonth()`;
  console.log('JQL query:', jql);
  
  try {
    const response = await api.asUser().requestJira(route`/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql: jql,
        fields: ['originalEstimate']
      })
    });
    
    console.log('API response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!data.issues) {
      console.error('No issues array in response');
      return 0;
    }
    
    console.log('Number of issues found:', data.issues.length);
    
    let totalHours = 0;
    data.issues.forEach(issue => {
      const budgetValue = issue.fields.originalEstimate;
      if (budgetValue) {
        totalHours += parseFloat(budgetValue);
      }
    });
    
    console.log('Total hours calculated:', totalHours);
    return totalHours;
  } catch (error) {
    console.error('Error fetching month hours:', error);
    return 0;
  }
});


export const handler = resolver.getDefinitions();