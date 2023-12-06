import { FieldType } from "@lark-base-open/js-sdk";

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
			let date = new Date(timeStamp);
			let day = date.getDate();
			let month = date.getMonth() + 1; // 月份是从 0 开始的
			let year = date.getFullYear();
			return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
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

// 用官方的 table.getCellValue 方法获取一列字段的值，字段的值中可能有列表
export function getFieldValues(records: any, table: any, field: any): Promise<any[]> {
	return Promise.all(records.map((record: any) => table.getCellValue(field.context[1], record.recordId)));
}

// 用自己映射的方法获取单个字段的值，字段的值已经被处理
export function getFieldValuesByRecords(records: any[], field: any): Promise<any[]> {
	return Promise.all(records.map(async record => FIELDS[await field.getType()].getCellValue(record, field)));
}

// 返回一个视图中的记录组成的列表，记录中包括未被处理的值
export async function getViewRecords(view: any, table: any): Promise<any[]> {
	return Promise.all((await view.getVisibleRecordIdList()).map((recordId: string) => table.getRecordById(recordId)));
}
