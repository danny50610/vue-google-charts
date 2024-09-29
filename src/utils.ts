import {
  GoogleChartWrapper,
  GoogleChartWrapperChartType,
  GoogleDataTable,
  GoogleDataView,
  GoogleViz,
  GoogleVizEventName,
  GoogleVizEvents,
} from './types';

export interface ICreateChartFunction {
  (
    el: HTMLElement,
    google: GoogleViz,
    type: GoogleChartWrapperChartType
  ): GoogleChartWrapper;
}

export interface ICreateDataTableFunction {
  (dataTable: GoogleDataTable | GoogleDataView): void;
}

export function getValidChartData(
  chartsLib: null | GoogleViz,
  data: unknown[][] | GoogleDataTable | Record<string, any> | null,
  isFirstRowLabels?: boolean,
  createDataTableFunction?: ICreateDataTableFunction
): GoogleDataTable | GoogleDataView | null {
  let result = null;

  if (
    chartsLib !== null &&
    (data instanceof chartsLib.visualization.DataTable ||
      data instanceof chartsLib.visualization.DataView)
  ) {
    result = data;
  } else if (chartsLib !== null && Array.isArray(data)) {
    result = chartsLib.visualization.arrayToDataTable(data, isFirstRowLabels);
  } else if (chartsLib !== null && data !== null && typeof data === 'object') {
    result = new chartsLib.visualization.DataTable(data);
  }

  if (result) {
    if (createDataTableFunction !== undefined) {
      createDataTableFunction(result);
    }
  }

  return result;
}

export function createChartObject(
  chartsLib: GoogleViz | null,
  chartObject: GoogleChartWrapper | null,
  chartEl: HTMLElement | null,
  chartType: GoogleChartWrapperChartType,
  chartEvents: GoogleVizEvents | null,
  createChartFunction?: ICreateChartFunction
): GoogleChartWrapper | null {
  const createChart: ICreateChartFunction = (
    el: HTMLElement,
    google: GoogleViz,
    type: GoogleChartWrapperChartType
  ): GoogleChartWrapper => {
    if (type === undefined) {
      throw new Error('please, provide chart type property');
    }

    return new google.visualization[type](el);
  };

  if (chartsLib === null) {
    throw new Error('please, provide charts lib property');
  }

  if (chartEl === null) {
    throw new Error('please, provide chart element property');
  }

  const fn = createChartFunction || createChart;

  chartObject = fn(chartEl, chartsLib, chartType);

  attachListeners(chartsLib, chartObject, chartEvents);

  return chartObject;
}

function attachListeners(
  chartsLib: null | GoogleViz,
  chartObject: GoogleChartWrapper | null,
  chartEvents: GoogleVizEvents | null
): void {
  if (chartEvents === null) {
    return;
  }

  for (const [event, listener] of Object.entries(chartEvents)) {
    if (chartsLib !== null && chartObject !== null) {
      chartsLib.visualization.events.addListener(
        chartObject,
        event as GoogleVizEventName,
        listener as (chartWrapper: GoogleChartWrapper) => any
      );
    }
  }
}
