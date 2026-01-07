import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
    NodeConnectionType,
    IExecuteFunctions
} from 'n8n-workflow';

export class VerificarEmail implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Verificar Email',
        name: 'verificarEmail',
        icon: 'file:mail.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Verifica la validez de un correo electrónico usando emaliable.com',
        defaults: {
            name: 'Verificar Email',
        },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        usableAsTool: true,
        credentials: [
            {
                name: 'VerificarEmailApi',
                required: true,
            },
        ],
        /* requestDefaults: {
            baseURL: 'https://api.emailable.com/v1/verify',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }, */
        properties: [
            {
                displayName: 'Direccion De Email',
                name: 'email',
                type: 'string',
                placeholder: 'ejemplo@gmail.com',
                default: '',
                /* routing: {
                    request: {
                        qs: {
                            email: '={{$value}}',
                        },
                    },
                }, */
            },
            // Operations will go here
        ],
    };
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: Array<{ json: IDataObject }> = [];

        for (let i = 0; i < items.length; i++) {
            const email = this.getNodeParameter(parameterName: 'email', i) as string;
            const credentials = await this.getCredentials(type: 'VerificarEmailApi');
            const apiKey = credentials?.apiKey as string;
            const response = await this.helpers.httpRequestrequest({
                method: 'GET',
                url: 'https://api.emailable.com/v1/verify',
                qs: {
                    email: email,
                    api_key: apiKey,
                },
                headers: {
                    Accept: 'application/json',
                },
                json: true,
            })

            const result = Array.isArray(response) ? response : [response];

            for (const res of result) {
                returnData.push({
                    json: {
                        email: res.email,
                        delivearble: res.state === 'deliverable',
                        score: res.score,
                    }
                });
            }

        }
        return this.prepareOutputData(returnData);
	}
}
