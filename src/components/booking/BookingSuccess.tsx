import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/api";
import { CheckCircle, FileText, ArrowRight } from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";

interface Props {
  bookingId: string;
  trackingId: string;
  userId: string;
}

const BookingSuccess = ({ bookingId, trackingId, userId }: Props) => {
  const [documents, setDocuments] = useState<any[]>([]);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("booking_documents")
      .select("*")
      .eq("booking_id", bookingId);
    setDocuments(data || []);
  };

  useEffect(() => {
    fetchDocs();
  }, [bookingId]);

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-card border border-primary/30 rounded-xl p-8 text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-3">
          Your tracking ID is:
        </p>
        <p className="text-2xl font-heading font-bold text-primary mb-4">{trackingId}</p>
        <p className="text-sm text-muted-foreground">
          Save this ID to track your booking status anytime.
        </p>
      </div>

      {/* Document Upload */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading text-lg font-bold mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Upload Documents
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Please upload your required documents to proceed with visa processing.
        </p>
        <DocumentUpload
          bookingId={bookingId}
          userId={userId}
          documents={documents}
          onUploaded={fetchDocs}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={`/track?id=${trackingId}`}
          className="flex-1 py-3 rounded-md text-sm font-semibold text-center inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity shadow-gold"
        >
          Track Booking <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/dashboard"
          className="flex-1 py-3 rounded-md text-sm font-semibold text-center inline-flex items-center justify-center gap-2 border border-border text-foreground hover:bg-secondary transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
