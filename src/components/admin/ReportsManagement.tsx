import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reported_tip_id: string | null;
  reported_comment_id: string | null;
  reported_user_id: string | null;
}

const ReportsManagement = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Kunne ikke laste rapporter');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          resolved_by: status === 'resolved' ? (await supabase.auth.getUser()).data.user?.id : null,
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Rapport ${status === 'resolved' ? 'løst' : 'avvist'}`);
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Kunne ikke oppdatere rapport');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'destructive',
      reviewing: 'secondary',
      resolved: 'default',
      dismissed: 'outline',
    };

    const labels: Record<string, string> = {
      pending: 'Venter',
      reviewing: 'Under behandling',
      resolved: 'Løst',
      dismissed: 'Avvist',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Rapporter</h2>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Velg status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="pending">Venter</SelectItem>
            <SelectItem value="reviewing">Under behandling</SelectItem>
            <SelectItem value="resolved">Løst</SelectItem>
            <SelectItem value="dismissed">Avvist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(report.status)}
                  <span className="text-sm text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString('nb-NO')}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{report.reason}</h3>
                {report.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {report.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Type:{' '}
                  {report.reported_tip_id
                    ? 'Tips'
                    : report.reported_comment_id
                    ? 'Kommentar'
                    : report.reported_user_id
                    ? 'Bruker'
                    : 'Ukjent'}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                {report.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateReportStatus(report.id, 'reviewing')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateReportStatus(report.id, 'resolved')}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateReportStatus(report.id, 'dismissed')}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {reports.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-8">
            Ingen rapporter funnet
          </p>
        )}
      </div>
    </Card>
  );
};

export default ReportsManagement;
