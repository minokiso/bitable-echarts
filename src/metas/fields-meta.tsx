import { FieldType } from "@lark-base-open/js-sdk";
import { time } from "echarts";
export const FIELDS: any = {
	[FieldType.Text]: {
		getCellValue: (record: any, field: any) => record.fields[typeof field === "string" ? field : getFieldId(field)]?.[0].text,
		X: true,
		Y: true,
		axisType: "category",
	},
	// [FieldType.SingleSelect]: {
	// 	allowX: true,
	// },
	[FieldType.DateTime]: {
		getCellValue: (record: any, field: any) => {
			let timeStamp = record.fields[typeof field === "string" ? field : getFieldId(field)];
			if (!timeStamp) {
				return;
			}
			return time.format(timeStamp, "{yyyy}-{MM}-{dd}", false);
		},
		X: true,
		Y: true,
		axisType: "category",
	},
	[FieldType.Number]: {
		getCellValue: (record: any, field: any) => record.fields[typeof field === "string" ? field : getFieldId(field)],
		X: true,
		Y: true,
		Z: true,
		axisType: "value",
	},
	[FieldType.User]: {
		getCellValue: (record: any, field: any) => record.fields[typeof field === "string" ? field : getFieldId(field)]?.map((user: any) => user?.name).join("、"),
		X: true,
		Y: true,
		axisType: "category",
	},

	getAllowedFields(type: "X" | "Y" | "Z") {
		let fields: number[] = [];
		Object.keys(this).forEach(field => {
			if (this[field][type]) {
				fields.push(Number(field));
			}
		});
		return fields;
	},
};

// 获取字段的id
export function getFieldId(field: any): string {
	return field.context[1];
}

// 用官方的 table.getCellValue 方法获取一列字段的值，字段的值中可能有数组
export function getFieldValues(records: any, table: any, field: any): Promise<any[]> {
	return Promise.all(records.map((record: any) => table.getCellValue(field.context[1], record.recordId)));
}

// 用自己映射的方法获取单个字段的值，字段的值已经被处理
export function getFieldValuesByRecords(records: any[], field: any): Promise<any[]> {
	return Promise.all(records.map(async record => FIELDS[await field.getType()].getCellValue(record, field)));
}

// 返回一个视图中的记录嵌套记录的值的二维数组，记录中包括未被处理的值
export async function getViewRecords(view: any, table: any): Promise<any[]> {
	return Promise.all((await view.getVisibleRecordIdList()).map((recordId: string) => table.getRecordById(recordId)));
}

export async function getViewRecordsCellString(view: any, table: any, fieldMetaList: any) {
	let _records = [];

	for (let recordId of await view.getVisibleRecordIdList()) {
		_records.push(
			await Promise.all(
				fieldMetaList.map((meta: any) => {
					return table.getCellString(meta.id, recordId);
				})
			)
		);
	}
	return _records;
}
