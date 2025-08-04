async function addTaskToNotion(notion, dbId, tasktitle, taskdesc="") {
  try {
    const res = await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        Task: {
          title: [{ text: { content: tasktitle } }],
        },
        Completed: {
          checkbox: false,
        },
      },
    });
    return res;
  } catch (err) {
    console.error('Failed to create task in Notion:', err);
    throw err;
  }
}

async function fetchTasksFromNotion(notion, dbId) {
  try {
    const res = await notion.databases.query({ database_id: dbId });
    const tasks = res.results.map(page => {
      const properties = page.properties;
      return {
        id: page.id,
        task: properties.Task.title[0]?.plain_text || 'Untitled',
        done: properties.Completed.checkbox,
      };
    });
    return tasks;
  } catch (err) {
    console.error('Failed to fetch tasks from Notion:', err);
    throw err;
  }
}

async function updateStatusInNotion(notion, id, done) {
  try {
    const res = await notion.pages.update({
      page_id: id,
      properties: {
        Completed: {
          checkbox: done
        },
      },
    });
    return res;
  } catch (err) {
    console.error('Failed to update task status in Notion:', err);
    throw err;
  }
}

async function deleteTaskInNotion(notion, id) {
  try {
    const res = await notion.pages.update({
      page_id: id,
      in_trash: true,
    });
    return res;
  } catch (err) {
    console.error('Failed to delete task in Notion:', err);
    throw err;
  }
}

module.exports = { addTaskToNotion, fetchTasksFromNotion, updateStatusInNotion, deleteTaskInNotion };