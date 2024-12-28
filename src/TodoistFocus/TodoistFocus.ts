/**
 * Variables used by Scriptable.
 * These must be at the very top of the file. Do not edit.
 * icon-color: red; icon-glyph: check;
 */

/**
 * Widget to get a Todoist task based on a filter
 * If a filter has multiple sections, will get a random task from the first section that has tasks
 * The script remembers the last selected task, and keeps showing that task while it matches
 * the above condition (being part of the first section with tasks).
 *
 * You can find your API_TOKEN from the Todoist Web app, at Todoist Settings -> Integrations -> API token
 * For FILTER_NAME you should use exactly the same name as your filter (including casing).
 */

type TodoistFilter = {
  id: number;
  name: string;
  query: string;
};

type TodoistTask = {
  id: number;
  content: string;
};

interface CacheData {
  lastTaskId?: number;
}

const API_TOKEN = "20fdade709c084c2e255e56e57d0e53370e8283e";
const FILTER_NAME = "⭐🟢 Focused";
const CACHE_FILE = "TodoistFocusCache.json";

async function getTask(): Promise<TodoistTask | { content: string; id?: number }> {
  console.log("Starting getTask() ...");
  const filters = await getFilters();
  console.log("Filters received: " + JSON.stringify(filters));

  const filter = filters.reduce<TodoistFilter | null>((acc, curr) => {
    return curr.name === FILTER_NAME ? curr : acc;
  }, null);

  console.log("Found filter: " + JSON.stringify(filter));

  if (filter == null) {
    console.log("No filter found by given name");
    console.log(filters);
    throw new Error("No filter found by given name");
  } else {
    console.log(`Filter found ${JSON.stringify(filter)}`);
  }

  const lastShownTaskId = await getLastShownTaskId();

  // Split query by comma, query all in parallel
  const queries = filter.query.split(",");
  const taskRequests = queries.map((query) => getTasksByFilter(query));
  const taskSections = await Promise.all(taskRequests);
  console.log("taskSections: " + JSON.stringify(taskSections));

  // Get random task from first section that has a task
  for (const tasks of taskSections) {
    if (tasks.length > 0) {
      let index = Math.floor(Math.random() * tasks.length * 0.999);

      // Check if any of the tasks was shown in previous round, then use that one
      if (lastShownTaskId != null) {
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].id === lastShownTaskId) {
            index = i;
            break;
          }
        }
      }

      const task = tasks[index];
      // Store
      await setLastShownTaskId(task.id);

      // Return here
      return task;
    } else {
      // Continue
    }
  }

  return { content: "NO TASK FOUND" };
}

async function getLastShownTaskId(): Promise<number | null> {
  const cache = await getCachedData(CACHE_FILE);
  console.log(`cache: ${JSON.stringify(cache)}`);
  if (cache.lastTaskId != null) {
    return cache.lastTaskId;
  } else {
    return null;
  }
}

async function setLastShownTaskId(id: number): Promise<void> {
  const cache = await getCachedData(CACHE_FILE);
  cache.lastTaskId = id;
  await cacheData(CACHE_FILE, cache);
}

/**
 * Get JSON from a local file
 * @param fileName
 * @returns object
 */
function getCachedData(fileName: string): CacheData {
  const fileManager = FileManager.iCloud();
  const cacheDirectory = fileManager.joinPath(fileManager.libraryDirectory(), "cache");
  const cacheFile = fileManager.joinPath(cacheDirectory, fileName);

  if (!fileManager.fileExists(cacheFile)) {
    console.log(`File does not exist: ${cacheFile}`);
    return {};
  }

  try {
    fileManager.downloadFileFromiCloud(cacheFile);
  } catch (e) {
    console.log(`Error downloading file from iCloud: ${e}`);
    return {};
  }

  let contents: string;
  try {
    contents = fileManager.readString(cacheFile);
  } catch (e) {
    console.log(`Error reading file: ${e}`);
    return {};
  }

  try {
    return JSON.parse(contents);
  } catch (e) {
    console.log(`Error parsing JSON: ${e}`);
    return {};
  }
}

/**
 * Write JSON to a local file
 * @param fileName
 * @param data
 */
function cacheData(fileName: string, data: CacheData): void {
  const fileManager = FileManager.iCloud();
  const cacheDirectory = fileManager.joinPath(fileManager.libraryDirectory(), "cache");
  const cacheFile = fileManager.joinPath(cacheDirectory, fileName);

  if (!fileManager.fileExists(cacheDirectory)) {
    fileManager.createDirectory(cacheDirectory);
  }

  const contents = JSON.stringify(data);
  fileManager.writeString(cacheFile, contents);
}

async function getFilters(): Promise<TodoistFilter[]> {
  const req = new Request("https://api.todoist.com/sync/v9/sync");
  req.method = "POST";
  req.headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
  };
  req.body = JSON.stringify({
    sync_token: "*",
    resource_types: '["filters"]',
  });

  const res = await req.loadJSON();
  // We assume res.filters is an array of objects meeting the TodoistFilter shape
  return res.filters;
}

async function getTasksByFilter(filter: string): Promise<TodoistTask[]> {
  const urlParams = "?filter=" + encodeURIComponent(filter);
  const req = new Request(`https://api.todoist.com/rest/v2/tasks${urlParams}`);
  req.method = "GET";
  req.headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
  };

  let json: TodoistTask[];
  try {
    json = await req.loadJSON();
  } catch (error) {
    // Check if Todoist returned a 410 Gone response for this filter query
    if (req.response && req.response.statusCode === 410) {
      console.error("Filter not recognized or no longer valid. Returning no tasks for this query.");
      return [];
    }

    console.error("Error parsing JSON response in getTasksByFilter(): " + JSON.stringify(error));
    // Log raw text response to help debug
    try {
      const rawText = await req.loadString();
      console.log("Raw response text: " + rawText);
    } catch (e2) {
      console.error("Failed to read raw response: " + JSON.stringify(e2));
    }
    throw error;
  }

  return json;
}

async function run(): Promise<void> {
  const listWidget = new ListWidget();
  listWidget.useDefaultPadding();

  try {
    const task = await getTask();

    const startColor = Color.dynamic(new Color("gray"), new Color("gray"));
    const endColor = Color.dynamic(new Color("lightGray"), new Color("lightGray"));
    const textColor = Color.dynamic(new Color("black"), new Color("black"));

    // BACKGROUND

    const gradient = new LinearGradient();
    gradient.colors = [startColor, endColor];
    gradient.locations = [0.0, 1];
    console.log({ gradient });

    listWidget.backgroundGradient = gradient;

    // MAIN Stack
    const widgetStack = listWidget.addStack();
    widgetStack.layoutHorizontally();
    widgetStack.topAlignContent();
    widgetStack.setPadding(0, 0, 0, 0);

    const contentStack = widgetStack.addStack();
    contentStack.layoutVertically();
    contentStack.topAlignContent();
    contentStack.setPadding(0, 0, 0, 0);

    // Helps with keeping contentStack to the left
    widgetStack.addSpacer();

    // HEADER
    const headStack = contentStack.addStack();
    headStack.layoutHorizontally();
    headStack.topAlignContent();
    headStack.setPadding(0, 0, 0, 0);

    const header = headStack.addText("Top Task".toUpperCase());
    header.textColor = textColor;
    header.font = Font.regularSystemFont(11);
    header.minimumScaleFactor = 1;

    // TASK
    const taskStack = contentStack.addStack();
    taskStack.layoutHorizontally();
    taskStack.topAlignContent();
    taskStack.setPadding(0, 0, 0, 0);

    const taskTitle = taskStack.addText(task.content);
    taskTitle.textColor = textColor;
    taskTitle.font = Font.semiboldSystemFont(25);
    taskTitle.minimumScaleFactor = 0.3;

    // CONTENT FOOTER
    // Helps with keeping content aligned to top
    contentStack.addSpacer();

    // TAP HANDLER
    if (task.id !== undefined) {
      listWidget.url = `todoist://task?id=${task.id}`;
    }
  } catch (error) {
    console.error("An error occurred in run(): " + JSON.stringify(error));
    console.log("Stack trace: " + (error && (error as Error).stack ? (error as Error).stack : "No stack trace available"));

    if (error === 666) {
      // Handle JSON parsing errors with a custom error layout
      listWidget.backgroundColor = new Color("999999");
      const header = listWidget.addText("Error".toUpperCase());
      header.textColor = new Color("000000");
      header.font = Font.regularSystemFont(11);
      header.minimumScaleFactor = 0.5;

      listWidget.addSpacer(15);

      const wordLevel = listWidget.addText("Couldn't connect to the server.");
      wordLevel.textColor = new Color("000000");
      wordLevel.font = Font.semiboldSystemFont(15);
      wordLevel.minimumScaleFactor = 0.3;
    } else {
      console.log(`Could not render widget: ${error}`);
      const errorWidgetText = listWidget.addText(`${error}`);
      errorWidgetText.textColor = Color.red();
      errorWidgetText.textOpacity = 30;
      errorWidgetText.font = Font.regularSystemFont(10);
    }
  }

  if (config.runsInApp) {
    await listWidget.presentSmall();
  }

  Script.setWidget(listWidget);
  Script.complete();
}

// Main entry point
await run();

// Exporting nothing as this is meant to be an entry script for Scriptable
export { };
