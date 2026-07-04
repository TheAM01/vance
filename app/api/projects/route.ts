import { connectToDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        const { db } = await connectToDatabase()
        const projects = await db
            .collection('projects')
            .find({})
            .sort({ createdAt: -1 })
            .toArray()
        return NextResponse.json(projects)
    } catch (error) {
        console.error('GET /api/projects error:', error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { db } = await connectToDatabase()
        const body = await request.json()

        if (!body.name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
        }

        const now = new Date().toISOString()
        const newProject = {
            name: body.name,
            type: body.type || 'Website',
            fields: Array.isArray(body.fields) ? body.fields : [],
            clientName: body.clientName || '',
            clientType: body.clientType || 'Individual',
            source: body.source || 'Direct',
            startedAt: body.startedAt || now.split('T')[0],
            deadline: body.deadline || '',
            prodUrl: body.prodUrl || '',
            githubUrl: body.githubUrl || '',
            notes: body.notes || '',
            amount: typeof body.amount === 'number' ? body.amount : Number(body.amount) || 0,
            currency: body.currency || '$',
            paid: !!body.paid,
            color: body.color || '#2563eb',
            status: body.status || 'active',
            tasks: [],
            changes: [],
            additionalLinks: body.additionalLinks || [],
            createdAt: now,
            updatedAt: now,
            completedAt: null,
        }

        const result = await db.collection('projects').insertOne(newProject as any)
        return NextResponse.json({ _id: result.insertedId, ...newProject })
    } catch (error) {
        console.error('POST /api/projects error:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
}
