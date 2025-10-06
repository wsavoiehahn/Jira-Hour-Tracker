import api, { route } from '@forge/api';
import Resolver from '@forge/resolver';


const resolver = new Resolver();


resolver.define('getHoursOfWeek', async (req) => {
  const { accountId } = req.payload;
  console.log('=== getHoursOfWeek called ===');
  console.log('Request payload:', req.payload);
  if (!accountId) {
    console.log('No accountId provided');
    return 0;
  }

  const jql = `assignee="${accountId}" AND duedate >= startOfWeek() AND duedate <= endOfWeek() AND status in ("To Do", Assigned, "In Progress", "Approved for Code Review", Approved, "Approved for Launch", "Approved for Merge", "On QA", "On Staging", "On Staging 1", "On Staging 2", "On Staging 3", Unassigned)`;
  console.log('JQL query:', jql);
  try {
    // Encode the JQL for URL
    const encodedJql = encodeURIComponent(jql);
    const url = `/rest/api/3/search?jql=${encodedJql}&fields=timeestimate`;
    
    console.log('Request URL:', url);
    
    const response = await api.asUser().requestJira(route`/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql: jql,
        fields: ['timeestimate']
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
    let totalSeconds = 0;
    data.issues.forEach(issue => {
      const estimatedTimeInSeconds = issue.fields.timeestimate;
      if (estimatedTimeInSeconds) {
        totalSeconds += parseFloat(estimatedTimeInSeconds);
      }
    });
      const totalHours = totalSeconds / 3600;
      console.log('Total hours calculated:', totalHours);
      return totalHours;
  } catch (error) {
      console.error('Error fetching week hours:', error);
      return 0;
  }
});

resolver.define('getHoursOfMonth', async (req) => {
  const { accountId } = req.payload;
  console.log('=== getHoursOfMonth called ===');
  console.log('Request payload:', req.payload);
  
  if (!accountId) {
    console.log('No accountId provided');
    return 0;
  }

  const jql = `assignee="${accountId}" AND duedate >= startOfMonth() AND duedate <= endOfMonth() AND status in ("To Do", Assigned, "In Progress", "Approved for Code Review", Approved, "Approved for Launch", "Approved for Merge", "On QA", "On Staging", "On Staging 1", "On Staging 2", "On Staging 3", Unassigned)`;
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
        fields: ['timeestimate']
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
    
    let totalSeconds = 0;
    data.issues.forEach(issue => {
      const estimatedTimeInSeconds = issue.fields.timeestimate;
      if (estimatedTimeInSeconds) {
        totalSeconds += parseFloat(estimatedTimeInSeconds);
      }
    });
    const totalHours = totalSeconds / 3600;
    console.log('Total hours calculated:', totalHours);
    return totalHours;
  } catch (error) {
    console.error('Error fetching month hours:', error);
    return 0;
  }
});


export const handler = resolver.getDefinitions();