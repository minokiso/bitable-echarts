import { memo, useEffect, useState } from "react";
import { FieldType, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { FIELDS, getFieldValuesByRecords } from "./fields-meta";

export const ThreeDForm = memo(({ onSubmit, bitable }: { onSubmit: Function; bitable: any }) => {
	const translation = useTranslation();
	const allowedXAxisFields = FIELDS.getAllowedFields("X");
	const allowedDataFields = FIELDS.getAllowedFields("Y");

	const callback = async (uiBuilder: UIBuilder, { t }: UseTranslationResponse<"translation", undefined>) => {
		uiBuilder.form(
			form => ({
				formItems: [
					form.tableSelect("table", { label: "选择数据表" }),
					form.viewSelect("view", { label: "选择视图", sourceTable: "table" }),
					form.fieldSelect("xAxisField", { label: "X 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedXAxisFields }),
					form.fieldSelect("yAxisField", { label: "Y 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedDataFields }),
					form.fieldSelect("zAxisField", { label: "Z 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedDataFields }),
					form.select("chartType", {
						label: "图表类型",
						options: [
							{ label: "3D 柱状图", value: "bar" },
							{ label: "3D 曲面图", value: "line" },
							{ label: "3D 散点图", value: "scatter" },
						],
						defaultValue: "bar",
					}),
				],
				buttons: ["确定"],
			}),
			async ({ key, values }: any) => {
				if (!values.view) {
					uiBuilder.message.error("请选择视图");
					return;
				}
				if (!(values.xAxisField && values.yAxisField && values.zAxisField)) {
					uiBuilder.message.error("请完整选择 X Y Z 轴字段");
					return;
				}
				onSubmit([key, values]);
			}
		);
	};

	useEffect(() => {
		const container: HTMLElement = document.querySelector("#container") as HTMLElement;
		const uiBuilder = new UIBuilder(container, {
			bitable,
			callback,
			translation,
		});
		return () => {
			uiBuilder.unmount();
		};
	}, [translation]);

	return <div id="container"></div>;
});

export const threeDFormSubmit = async (formData: any, setOption: Function) => {
	const [key, { table, view, xAxisField, yAxisField, zAxisField, chartType }] = formData;
	let records = await Promise.all((await view.getVisibleRecordIdList()).map((recordId: string) => table.getRecordById(recordId)));
	let xAxisRecords = await getFieldValuesByRecords(records, xAxisField);
	let yAxisRecords = await getFieldValuesByRecords(records, yAxisField);
	let zAxisRecords = await getFieldValuesByRecords(records, zAxisField);
	// let yAxisNames = await Promise.all(dataFields.map((dataField: any) => dataField.getName()));

	// setOption({
	// 	toolbox: {
	// 		show: true,
	// 		feature: {
	// 			// magicType: {
	// 			// 	type: ["line", "bar"],
	// 			// },
	// 			// restore: {},
	// 			saveAsImage: { pixelRatio: 2, name: yAxisNames.join("-") },
	// 		},
	// 	},
	// 	tooltip: {
	// 		trigger: "axis",
	// 		axisPointer: {
	// 			type: "shadow",
	// 		},
	// 	},
	// 	legend: {},
	// 	xAxis: {
	// 		data: xAxisRecords,
	// 		axisPointer: {
	// 			show: true,
	// 		},
	// 	},
	// 	yAxis: yAxisRecords.map((record, i) => {
	// 		return { name: yAxisNames[i], axisLine: { show: true }, offset: Math.max(40 * (i - 1), 0), alignTicks: true };
	// 	}),
	// 	series: yAxisRecords.map((record, i) => {
	// 		return { name: yAxisNames[i], type: chartType, data: record, yAxisIndex: i };
	// 	}),
	// });
};
